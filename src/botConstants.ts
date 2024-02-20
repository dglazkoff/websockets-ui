import {Ship} from "./types/game";

export const BOT_ID = 0;

export const botShips = [
    {
        "position": {
            "x": 1,
            "y": 1
        },
        "direction": false,
        "type": "huge",
        "length": 4
    },
    {
        "position": {
            "x": 6,
            "y": 4
        },
        "direction": false,
        "type": "large",
        "length": 3
    },
    {
        "position": {
            "x": 2,
            "y": 3
        },
        "direction": true,
        "type": "large",
        "length": 3
    },
    {
        "position": {
            "x": 7,
            "y": 0
        },
        "direction": true,
        "type": "medium",
        "length": 2
    },
    {
        "position": {
            "x": 3,
            "y": 7
        },
        "direction": true,
        "type": "medium",
        "length": 2
    },
    {
        "position": {
            "x": 0,
            "y": 9
        },
        "direction": false,
        "type": "medium",
        "length": 2
    },
    {
        "position": {
            "x": 0,
            "y": 5
        },
        "direction": false,
        "type": "small",
        "length": 1
    },
    {
        "position": {
            "x": 4,
            "y": 5
        },
        "direction": false,
        "type": "small",
        "length": 1
    },
    {
        "position": {
            "x": 1,
            "y": 7
        },
        "direction": true,
        "type": "small",
        "length": 1
    },
    {
        "position": {
            "x": 6,
            "y": 8
        },
        "direction": true,
        "type": "small",
        "length": 1
    }
] satisfies Ship[];