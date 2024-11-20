import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveImage(file: File, folder: string = 'packages'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const uniqueFilename = `${uuidv4()}-${file.name}`;
  const relativePath = `/uploads/${folder}/${uniqueFilename}`;
  const fullPath = join(process.cwd(), 'public', relativePath);

  // Ensure the directory exists
  const dir = join(process.cwd(), 'public', 'uploads', folder);
  await createDirIfNotExists(dir);

  // Save the file
  await writeFile(fullPath, buffer);
  return relativePath;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    // Only delete files from our uploads directory to prevent unauthorized deletions
    if (!imageUrl.startsWith('/uploads/')) return;

    const fullPath = join(process.cwd(), 'public', imageUrl);
    await unlink(fullPath);
  } catch (error) {
    // Ignore errors if file doesn't exist
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

async function createDirIfNotExists(dir: string) {
  const { mkdir } = require('fs/promises');
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}