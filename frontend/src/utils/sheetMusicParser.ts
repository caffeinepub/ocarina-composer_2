import type { Note } from '../backend';

/**
 * Attempts to parse note pitches from a sheet music image using canvas-based
 * heuristic analysis. This is a best-effort client-side approach.
 *
 * For reliable results, MusicXML or MIDI formats are recommended.
 */
export async function parseSheetMusicImage(file: File): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const notes = analyzeSheetMusicImage(img);
        URL.revokeObjectURL(url);
        resolve(notes);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file'));
    };

    img.src = url;
  });
}

function analyzeSheetMusicImage(img: HTMLImageElement): Note[] {
  const canvas = document.createElement('canvas');
  const maxWidth = 1200;
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Convert to grayscale
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Binarize (threshold)
  const threshold = 128;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    binary[i] = gray[i] < threshold ? 1 : 0; // 1 = dark pixel
  }

  // Detect horizontal staff lines (rows with high density of dark pixels)
  const rowDensity = new Float32Array(height);
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      count += binary[y * width + x];
    }
    rowDensity[y] = count / width;
  }

  // Find staff line rows (density > 0.4 means mostly dark horizontal line)
  const staffLineRows: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    if (rowDensity[y] > 0.4 && rowDensity[y] >= rowDensity[y - 1] && rowDensity[y] >= rowDensity[y + 1]) {
      // Avoid duplicates (staff lines are thin)
      if (staffLineRows.length === 0 || y - staffLineRows[staffLineRows.length - 1] > 3) {
        staffLineRows.push(y);
      }
    }
  }

  // We need at least 5 staff lines to identify a staff
  if (staffLineRows.length < 5) {
    throw new Error(
      'Could not detect staff lines in the image. ' +
      'Please ensure the image is a clear, high-contrast sheet music scan. ' +
      'For best results, use MusicXML or MIDI format instead.'
    );
  }

  // Take the first 5 staff lines as the primary staff
  const staff = staffLineRows.slice(0, 5);
  const lineSpacing = (staff[4] - staff[0]) / 4;

  // Detect note heads: look for roughly circular dark blobs between/on staff lines
  // Use a simple connected-component approach on the binary image
  const noteHeads = detectNoteHeads(binary, width, height, staff, lineSpacing);

  if (noteHeads.length === 0) {
    throw new Error(
      'No note heads detected in the image. ' +
      'The image may be too low resolution or the notes are not clearly visible. ' +
      'Try a higher quality scan or use MusicXML/MIDI format.'
    );
  }

  // Map note head vertical positions to pitch names
  // Standard treble clef: lines from bottom to top = E4, G4, B4, D5, F5
  // Spaces from bottom to top = F4, A4, C5, E5
  const notes = noteHeads.map((nh, i) => {
    const pitch = verticalPositionToPitch(nh.y, staff, lineSpacing);
    return {
      pitch,
      duration: 'quarter' as string,
      timingPosition: BigInt(i),
    };
  });

  return notes;
}

interface NoteHead {
  x: number;
  y: number;
  width: number;
  height: number;
}

function detectNoteHeads(
  binary: Uint8Array,
  width: number,
  height: number,
  staff: number[],
  lineSpacing: number
): NoteHead[] {
  const minSize = Math.max(4, Math.round(lineSpacing * 0.4));
  const maxSize = Math.round(lineSpacing * 1.2);

  // Scan for dark blobs in the staff region
  const staffTop = staff[0] - lineSpacing;
  const staffBottom = staff[4] + lineSpacing;

  const visited = new Uint8Array(width * height);
  const noteHeads: NoteHead[] = [];

  for (let y = Math.max(0, Math.round(staffTop)); y < Math.min(height, Math.round(staffBottom)); y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1 && !visited[idx]) {
        // BFS to find connected component
        const component: Array<[number, number]> = [];
        const queue: Array<[number, number]> = [[x, y]];
        visited[idx] = 1;

        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          component.push([cx, cy]);

          for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (binary[nidx] === 1 && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        if (component.length < minSize * minSize) continue;

        const xs = component.map(([cx]) => cx);
        const ys = component.map(([, cy]) => cy);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const blobW = maxX - minX + 1;
        const blobH = maxY - minY + 1;

        // Note heads are roughly oval/circular
        const aspectRatio = blobW / blobH;
        if (
          blobW >= minSize && blobW <= maxSize * 2 &&
          blobH >= minSize && blobH <= maxSize &&
          aspectRatio >= 0.5 && aspectRatio <= 2.5
        ) {
          noteHeads.push({
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            width: blobW,
            height: blobH,
          });
        }
      }
    }
  }

  // Sort by x position (left to right = temporal order)
  noteHeads.sort((a, b) => a.x - b.x);

  // Remove duplicates that are too close together
  const filtered: NoteHead[] = [];
  for (const nh of noteHeads) {
    if (filtered.length === 0 || nh.x - filtered[filtered.length - 1].x > lineSpacing * 0.5) {
      filtered.push(nh);
    }
  }

  return filtered;
}

/**
 * Map a vertical pixel position to a pitch name using treble clef conventions.
 * Staff lines (bottom to top): E4, G4, B4, D5, F5
 * Spaces (bottom to top): F4, A4, C5, E5
 */
function verticalPositionToPitch(y: number, staff: number[], lineSpacing: number): string {
  // Treble clef pitch sequence from bottom ledger line upward
  // Each step = half a lineSpacing (line or space)
  // Reference: bottom staff line (staff[0]) = E4 (step index 0)
  const pitchSequence = [
    'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6',
  ];

  // Distance from bottom staff line, in units of half-lineSpacing
  const halfSpace = lineSpacing / 2;
  const distFromBottom = staff[0] - y; // positive = above bottom line
  const steps = Math.round(distFromBottom / halfSpace);

  // Clamp to available pitches
  const clampedSteps = Math.max(0, Math.min(pitchSequence.length - 1, steps));
  return pitchSequence[clampedSteps];
}
