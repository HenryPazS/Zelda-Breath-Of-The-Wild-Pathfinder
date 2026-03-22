#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <climits>
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

    std::cout << "Loaded JSON" << std::endl;



    std::vector<Node> nodes;

    std::cout << "size = " << data.size() << std::endl;

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

    std::vector<std::vector<Node>> grid(height, std::vector<Node> (width));

    for (const Node& n : nodes) {
        grid[n.y][n.x] = n;
    }

    std::vector<std::vector<int>> dista(height, std::vector<int>(width, INT_MAX));

    std::vector<std::vector<bool>> visit(height, std::vector<bool>(width, false));

    std::vector<std::vector<std::pair<int, int>>>parent(height, std::vector<std::pair<int, int>> (width, {-1, -1}));

    dista[startY][startX] = 0;

    std::cout << grid[0][0].x << " "
          << grid[0][0].y << " "
          << grid[0][0].terrain << " "
          << grid[0][0].weight
          << std::endl;

    auto neigh = GNeigh(0, 0, width, height);

    for (auto& p : neigh) {
        std::cout << "(" << p.first << "," << p.second << ") ";
    }


    std::cout << std::endl;

    auto neigh2 = GNeigh(10, 10, width, height);

    for (auto& p : neigh2) {
        std::cout << "(" << p.first << "," << p.second << ") ";
    }

    std::cout << std::endl;

    std::cout << "Cost (0,0) = "
          << gCost(grid, 0, 0)
          << std::endl;

    std::cout << "Cost (10,10) = "
              << gCost(grid, 10, 10)
              << std::endl;

    for (auto& p : neigh2) {
        int cost = gCost(grid, p.first, p.second);

        std::cout << "Neighbor "
                  << p.first << "," << p.second
                  << " cost = "
                  << cost
                  << std::endl;
    }

    std::vector<std::pair<int,int>> tests = {
        {0,0},
        {1,1},
        {5,5},
        {10,10},
        {50,50},
        {100,100},
        {150,100},
        {200,150},
        {250,200},
        {300,200},
        {350,250},
        {399,299}
    };

    std::cout << "\n=== COST TESTS ===\n";

    for (auto& t : tests) {
        int x = t.first;
        int y = t.second;

        std::cout
            << "(" << x << "," << y << ") "
            << grid[y][x].terrain << " "
            << grid[y][x].weight
            << std::endl;
    }


    std::cout << "dist start = " << dista[startY][startX] << std::endl;
    std::cout << "dist 0,0 = " << dista[0][0] << std::endl;
    std::cout << "visited start = " << visit[startY][startX] << std::endl;
    std::cout << "parent start = ("
              << parent[startY][startX].first << ","
              << parent[startY][startX].second << ")"
              << std::endl;


    std::cout<< "[{\"px\": 100, \"py\": 100}, {\"px\": 200, \"py\": 200}]" << std::endl;
    return 0;
}