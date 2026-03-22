import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startNode, endNode, algorithm } = body;

        // go from frontend → project root → cmake-build-debug
        const buildDir = path.join(
            process.cwd(),
            '..',
            '..',
            'cmake-build-debug'
        );

        const exePath = path.join(buildDir, 'Project_2');

        const command =
            `"${exePath}" ${startNode.x} ${startNode.y} ${endNode.x} ${endNode.y} "${algorithm}"`;

        console.log("RUN:", command);

        const { stdout, stderr } =
            await execAsync(command, { cwd: buildDir });

        if (stderr) {
            console.error(stderr);
        }

        const parsedPath = JSON.parse(stdout.trim());

        return NextResponse.json({
            success: true,
            path: parsedPath
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}