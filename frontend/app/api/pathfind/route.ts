import {NextResponse} from 'next/server';
import { start } from 'repl';

export async function POST(request: Request) {
    try{
        const body =await request.json();
        const {startNode, endNode, algorithm} = body;

        console.log(`Received pathfinding request:`);
        console.log(`Algorithm: ${algorithm}`);
        console.log(`Start: [${startNode.x}, ${startNode.y}]`);
        console.log(`End: [${endNode.x}, ${endNode.y}]`);


        //Mock response for now
        const mockPath = [
            {px:startNode.px, py: startNode.py},
            {px: startNode.px + (endNode.px - startNode.px)*0.25, py: startNode.py + (endNode.py - startNode.py)*0.25},
            {px: startNode.px + (endNode.px - startNode.px)*0.50, py: startNode.py + (endNode.py - startNode.py)*0.50},
            {px: startNode.px + (endNode.px - startNode.px)*0.75, py: startNode.py + (endNode.py - startNode.py)*0.75},
            {px: endNode.px, py: endNode.py}
        ];

        return NextResponse.json({ success: true,path: mockPath});
    }catch(error){
        return NextResponse.json({ success: false, error: 'Failed to handle request' }, { status: 500 });
    }
}