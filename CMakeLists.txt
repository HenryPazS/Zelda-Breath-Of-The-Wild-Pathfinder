cmake_minimum_required(VERSION 3.10)
project(ZeldaPathfinder)
set (CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}")

add_executable(pathfinder pathfinder.cpp)