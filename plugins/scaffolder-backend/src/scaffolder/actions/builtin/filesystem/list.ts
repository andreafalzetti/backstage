/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createTemplateAction } from '../../createTemplateAction';
import fs from 'fs/promises';
import path from 'path';

const getFiles = async (
  dirPath: string,
  currentLevel: number,
  maxLevel: number,
  cb: (filepath: string) => void,
) => {
  if (currentLevel > maxLevel) {
    return;
  }

  const files = await fs.readdir(dirPath);

  files.forEach(async file => {
    const filepath = path.join(dirPath, file);
    const stat = await fs.stat(filepath);
    if (stat.isDirectory()) {
      await getFiles(filepath, currentLevel + 1, maxLevel, cb);
    } else {
      cb(filepath);
    }
  });
};

export const createFilesystemListAction = () => {
  return createTemplateAction<{ targetDir: string, depth: number }>({
    id: 'fs:list',
    schema: {
      input: {
        type: 'object',
        properties: {
          targetDir: {
            type: 'string',
            title: 'Target directory',
            description: 'The directory to scan',
          },
          depth: {
            type: 'number',
            title: 'Depth',
            description:
              'The amount of nested folders to recursively list their files',
          },
        },
      },
    },
    async handler(ctx) {
      const targetDir = ctx.input?.targetDir || ctx.workspacePath;
      const depth = ctx.input?.depth || 0;

      ctx.logger.info(`Start listing files with depth ${depth} in workspace`);

      await getFiles(targetDir, 0, depth, (filepath: string) => {
        ctx.logger.info(filepath);
      });

      ctx.logger.info(`Listing files in workspace complete`);
    },
  });
};
