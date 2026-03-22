#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <climits>
#include <algorithm>
#include "json.hpp"
using json = nlohmann::json;

struct Node {
        int x;
        int y;
        int weight;
        std::string terrain;
};

std::vector<std::pair<int, int>> GNeigh(int x, int y, int width, int height) {
    std::vector<std::pair<int, int>> neighbors;

    if (x + 1 < width) {
        neighbors.push_back({x + 1, y});
    }

    if (x - 1 >= 0) {
        neighbors.push_back({x - 1, y});
    }

    if (y + 1 < height) {
        neighbors.push_back({x, y + 1});
    }

    if (y -1 >= 0) {
        neighbors.push_back({x, y - 1});
    }

    return neighbors;
}

int gCost(const std::vector<std::vector<Node>>& grid, int x, int y) {
    return grid[y][x].weight;
}


struct HeapNode {
    int priority;
    int x;
    int y;
};

class MinHeap {
private:
    std::vector<HeapNode> heap;

public:
    bool empty() const {
        return heap.empty();
    }
    HeapNode top() const {
        return heap[0];
    }
    void push(const HeapNode& node) {
        heap.push_back(node);
        heapifyUp(heap.size()-1);
    }
    void pop() {
        if (heap.empty()) {
            return;
        }

        heap[0] = heap.back();

        heap.pop_back();

        if (!heap.empty()) {
            heapifyDown(0);
        }

    }

private:
    void heapifyUp(int index) {
        while (index > 0) {
            int par = (index - 1) / 2;

            if (heap[index].priority < heap[par].priority) {
                std::swap(heap[index], heap[par]);
                index = par;
            }

            else {
                break;
            }
        }
    }
    void heapifyDown(int index) {
        int size = heap.size();

        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int smallest = index;

            if (left < size && heap[left].priority < heap[smallest].priority) {
                smallest = left;
            }

            if (right < size && heap[right].priority < heap[smallest].priority) {
                smallest = right;
            }

            if (smallest != index) {
                std::swap(heap[index], heap[smallest]);
                index = smallest;
            }

            else {
                break;
            }
        }
    }
};

int heuristic(int x, int y, int endX, int endY) {
    return std::abs(x - endX) + std::abs(y - endY);
}


int main(int argc, char* argv[]){

    if (argc != 6){
        std::cerr << "Wrong number of arguments" << std::endl;
        return 1;
       }


    int startX = std::stoi(argv[1]);
    int startY = std::stoi(argv[2]);
    int endX = std::stoi(argv[3]);
    int endY = std::stoi(argv[4]);
    std::string algorithm = argv[5];


    std::ifstream f("../Zelda-Breath-Of-The-Wild-Pathfinder/nodes.json");

    if (!f) {
        std::cerr << "Failed to open nodes.json" << std::endl;
        return 1;
    }

    json data;
    f >> data;

    std::vector<Node> nodes;

    for (auto& item : data) {
        Node n;
        n.x = item["x"];
        n.y = item["y"];
        n.weight = item["elevation_weight"];
        n.terrain = item["terrain_type"];

        nodes.push_back(n);
    }


    int width = 400;
    int height = 300;

    if (startX < 0 || startX >= width || startY < 0 || startY >= height ||
    endX < 0 || endX >= width || endY < 0 || endY >= height) {
        std::cout << "[]" << std::endl;
        return 0;
    }

    std::vector<std::vector<Node>> grid(height, std::vector<Node> (width));

    for (const Node& n : nodes) {
        grid[n.y][n.x] = n;
    }

    std::vector<std::vector<int>> dista(height, std::vector<int>(width, INT_MAX));

    std::vector<std::vector<bool>> visit(height, std::vector<bool>(width, false));

    std::vector<std::vector<std::pair<int, int>>>parent(height, std::vector<std::pair<int, int>> (width, {-1, -1}));

    dista[startY][startX] = 0;

    if (algorithm == "Dijkstra" ||  algorithm == "dijkstra") {
        MinHeap pq;
        pq.push({0, startX, startY});

        while (!pq.empty()) {
            HeapNode cur = pq.top();
            pq.pop();
            int curX = cur.x;
            int curY = cur.y;

            if (visit[curY][curX]) {
                continue;
            }

            visit[curY][curX] = true;

            if (curX == endX && curY == endY) {
                break;
            }

            auto neighbors = GNeigh(curX, curY, width, height);

            for (auto& p : neighbors) {
                int nx = p.first;
                int ny = p.second;

                if (visit[ny][nx]) {
                    continue;
                }

                int newDista = dista[curY][curX] + gCost(grid, nx, ny);

                if (newDista < dista[ny][nx]) {
                    dista[ny][nx] = newDista;
                    parent[ny][nx] = {curX, curY};
                    pq.push({newDista, nx, ny});
                }
            }
        }
    }

    else if (algorithm == "a*" || algorithm == "A*" || algorithm == "astar" || algorithm == "Astar") {
        MinHeap pq;
        pq.push({heuristic(startX, startY, endX, endY), startX, startY});

        while (!pq.empty()) {
            HeapNode cur = pq.top();
            pq.pop();
            int curX = cur.x;
            int curY = cur.y;

            if (visit[curY][curX]) {
                continue;
            }

            visit[curY][curX] = true;

            if (curX == endX && curY == endY) {
                break;
            }

            auto neighbors = GNeigh(curX, curY, width, height);

            for (auto& p : neighbors) {
                int nx = p.first;
                int ny = p.second;

                if (visit[ny][nx]) {
                    continue;
                }

                int newDista = dista[curY][curX] + gCost(grid, nx, ny);

                if (newDista < dista[ny][nx]) {
                    dista[ny][nx] = newDista;
                    parent[ny][nx] = {curX, curY};

                    int priority = newDista +heuristic(nx, ny, endX, endY);
                    pq.push({priority, nx, ny});
                }
            }
        }
    }

    else {
        std::cerr << "invalid algorithm" << std::endl;
        return 1;
    }

    std::vector<std::pair<int, int>> path;

    if (dista[endY][endX] != INT_MAX) {
        int cx = endX;
        int cy = endY;

        while (!(cx == startX && cy == startY)) {
            path.push_back({cx, cy});

            auto par = parent[cy][cx];

            if (par.first == -1 && par.second == -1) {
                break;
            }

            cx = par.first;
            cy = par.second;
        }

        path.push_back({startX, startY});
        std::reverse(path.begin(), path.end());
    }


    std::cout << "[";
    for (size_t i = 0; i < path.size(); i++) {

        std::cout << "{\"px\": "
                  << path[i].first
                  <<", \"py\": "
                  <<path[i].second
                  << "}";

        if (i + 1 < path.size()) {
            std::cout << ",";
        }
    }

    std::cout << "]" << std::endl;

    return 0;
}

