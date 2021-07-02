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

import * as os from 'os';
import mockFs from 'mock-fs';
import { resolve as resolvePath } from 'path';
import { createFilesystemListAction } from './list';
import { PassThrough } from 'stream';

const root = os.platform() === 'win32' ? 'C:\\rootDir' : '/rootDir';
const workspacePath = resolvePath(root, 'my-workspace');

describe('fs:list', () => {
  const action = createFilesystemListAction();

  const mockLogger = { child: jest.fn(), error: jest.fn(), info: jest.fn() };

  const mockContext = {
    input: {
      depth: 2,
      targetDir: workspacePath,
    },
    workspacePath,
    logger: mockLogger as any,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    mockFs({
      [workspacePath]: {
        'unit-test-a.js': 'hello',
        'unit-test-b.js': 'world',
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should list files in the workspace', async () => {
    await action.handler(mockContext);
    expect(mockLogger.info).toHaveBeenCalledWith('Start listing files with depth 0 in workspace');
    expect(mockLogger.info).toHaveBeenCalledWith('Listing files in workspace complete');
  });
});
