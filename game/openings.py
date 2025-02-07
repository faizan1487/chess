OPENING_BOOK = {
    # Sicilian Defense - Expanded Variations
    "Sicilian Defense": [
        ("e2", "e4"), ("c7", "c5")
    ],
    "Sicilian Najdorf": [
        ("e2", "e4"), ("c7", "c5"),
        ("g1", "f3"), ("d7", "d6"),
        ("d2", "d4"), ("c5", "d4"),
        ("b1", "c3"), ("a7", "a6")  # Najdorf move
    ],
    "Sicilian Dragon": [
        ("e2", "e4"), ("c7", "c5"),
        ("g1", "f3"), ("d7", "d6"),
        ("d2", "d4"), ("c5", "d4"),
        ("b1", "c3"), ("g7", "g6")  # Dragon move
    ],
    "Sicilian Classical": [
        ("e2", "e4"), ("c7", "c5"),
        ("g1", "f3"), ("d7", "d6"),
        ("d2", "d4"), ("c5", "d4"),
        ("b1", "c3"), ("b8", "c6")  # Classical move
    ],

    # French Defense - Expanded
    "French Defense": [
        ("e2", "e4"), ("e7", "e6"),
        ("d2", "d4"), ("d7", "d5")
    ],
    "French Advance": [
        ("e2", "e4"), ("e7", "e6"),
        ("d2", "d4"), ("d7", "d5"),
        ("e4", "e5")  # Advance move
    ],
    "French Classical": [
        ("e2", "e4"), ("e7", "e6"),
        ("d2", "d4"), ("d7", "d5"),
        ("b1", "c3"), ("g8", "f6")  # Classical move
    ],

    # Caro-Kann Defense
    "Caro-Kann Defense": [
        ("e2", "e4"), ("c7", "c6"),
        ("d2", "d4"), ("d7", "d5")
    ],
    "Caro-Kann Classical": [
        ("e2", "e4"), ("c7", "c6"),
        ("d2", "d4"), ("d7", "d5"),
        ("b1", "c3"), ("d5", "e4"),
        ("c3", "e4"), ("g8", "f6")  # Classical move
    ],

    # Ruy-Lopez - Expanded
    "Ruy-Lopez": [
        ("e2", "e4"), ("e7", "e5"),
        ("g1", "f3"), ("b8", "c6"),
        ("f1", "b5")  # Standard Ruy-Lopez
    ],
    "Ruy-Lopez Morphy Defense": [
        ("e2", "e4"), ("e7", "e5"),
        ("g1", "f3"), ("b8", "c6"),
        ("f1", "b5"), ("a7", "a6")  # Morphy move
    ],

    # Queen's Gambit
    "Queen's Gambit": [
        ("d2", "d4"), ("d7", "d5"),
        ("c2", "c4")
    ],
    "Queen's Gambit Declined": [
        ("d2", "d4"), ("d7", "d5"),
        ("c2", "c4"), ("e7", "e6")
    ],

    # London System
    "London System": [
        ("d2", "d4"), ("d7", "d5"),
        ("g1", "f3"), ("g8", "f6"),
        ("c1", "f4")
    ],

    # Scandinavian Defense
    "Scandinavian Defense": [
        ("e2", "e4"), ("d7", "d5")
    ],

    "Unknown Opening": []
}
