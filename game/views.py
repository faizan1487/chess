from django.shortcuts import render, redirect
from django.http import JsonResponse

from .helpers import is_ajax
from .movePieces import movePieces

from .controller import controller

from .engine import MiniMax

import math,csv,time

def chooseMode(request):
    return render(request, 'choosePage.html')

def playLocal(request):
    return render(request, 'chessPage.html',{'aiCol':None})

def playAI(request):
    return render(request, 'chessPage.html',{'aiCol':request.session['aiColor']})


from .engine import MiniMax, detect_opening  # Import detect_opening function


def board(request):
    # Initialize session variables if they don't exist
    request.session.setdefault('turn', True)
    request.session.setdefault('board', [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ])
    request.session.setdefault('movedStatus', [(False, False, False), (False, False, False)])
    request.session.setdefault('enPassant', (False, "", ""))
    request.session.setdefault('captureStatus', [(), ()])
    request.session.setdefault('aiColor', None)
    
    # ✅ Reset move_list if the game restarts
    if 'move_list' not in request.session or len(request.session['move_list']) > 10:
        print("🔄 Resetting Move List (Game Restart)")
        request.session['move_list'] = []

    # ✅ Ensure the first move clears any previous game's data
    elif len(request.session['move_list']) == 0:
        request.session['move_list'] = []

    board = request.session['board']
    turn = request.session['turn']
    movedStatus = request.session['movedStatus']
    enPassant = request.session['enPassant']
    captureStatus = request.session['captureStatus']
    aiColor = request.session['aiColor']

    if is_ajax(request):
        square = request.POST.get('sqId')
        newSquare = request.POST.get('newSqId')
        oldSquare = request.POST.get('oldSqId')

        aiCol = request.POST.get('aiCol')
        if aiCol == 'False':
            aiCol = False
        if aiCol == 'True':
            aiCol = True

        jsResponseInfo = {'board': board, 'turn': turn}

        # Fetch legal moves for selected piece
        if square:
            moves, checkMate, draw = controller(square, board, turn, movedStatus, enPassant)
            return JsonResponse({
                'moves': moves, 
                'checkMate': checkMate, 
                'draw': draw, 
                'captureStatus': captureStatus
            })

        # Process player's move
        if newSquare:
            request.session['board'] = movePieces(oldSquare, newSquare, board, movedStatus, enPassant, captureStatus)
            request.session['turn'] = not request.session['turn']
            turn = request.session['turn']
            
            algebraic_old = convert_to_algebraic(oldSquare)
            algebraic_new = convert_to_algebraic(newSquare)

            # ✅ Ensure all moves are stored as tuples (force conversion)
            new_move = (algebraic_old, algebraic_new)

            # ✅ Convert all existing moves in move_list to tuples (fix previous incorrect moves)
            request.session['move_list'] = [tuple(m) if isinstance(m, list) else m for m in request.session['move_list']]

            # ✅ Prevent duplicate moves from being added
            if len(request.session['move_list']) == 0 or request.session['move_list'][-1] != new_move:
                request.session['move_list'].append(new_move)

            # ✅ Dynamically detect new opening
            detected_opening = detect_opening(request.session['move_list'])

            # ✅ If new move starts a different opening, reset move_list
            if detected_opening != detect_opening(request.session['move_list'][:-1]):
                print(f"🔄 Switching to new opening: {detected_opening}")
                request.session['move_list'] = [new_move]

            # ✅ Limit move_list length to 10 moves (opening phase only)
            request.session['move_list'] = request.session['move_list'][:10]

            # ✅ Print move list for debugging
            print(f"Updated Move List (Filtered, Tuples Only): {request.session['move_list']}")

            # Detect Opening
            print(f"✅ Detected Opening: {detected_opening}")
            return JsonResponse({
                'board': board,
                'turn': turn,
                'opening': detected_opening
            })

        # AI Move
        if aiCol == turn:
            startTime = time.time()
            aiEval, aiMove, _ = MiniMax(board, 3, -math.inf, math.inf, turn)  # AI Move Calculation
            endTime = time.time()
            timeDelta = endTime - startTime

            request.session['turn'] = not request.session['turn']
            turn = request.session['turn']
            request.session['board'] = movePieces(aiMove[1], aiMove[2], board, movedStatus, enPassant, captureStatus)

            # Log AI move time for performance tracking
            with open('data.csv', 'a') as file:
                writer = csv.writer(file)
                writer.writerow([aiMove, timeDelta])

            return JsonResponse({
                'board': board,
                'turn': turn,
                'aiEvaluation': aiEval,
                'aiBestMove': aiMove,
                'opening': detect_opening(request.session['move_list'])  # Ensure opening updates
            })

        return JsonResponse(jsResponseInfo)

    # Handle user color selection for playing against AI
    if request.method == 'POST':
        playColor = request.POST.get('mySelect')
        request.session['aiColor'] = False if playColor == 'white' else True
        return redirect('playAI')

def resetBoard(request):
    request.session['board'] = [
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"]
        ]
    request.session['turn'] = True
    request.session['movedStatus'] = [(False,False,False),(False,False,False)]

    request.session['enPassant'] = False,"",""
    request.session['captureStatus'] = [(),()]
    request.session['aiColor'] = None
    
    # ✅ Clear the move list when resetting the board
    request.session['move_list'] = []

    with open('data.csv','a') as file:
        writer = csv.writer(file)
        writer.writerow(['iterations','time'])
    return redirect('chooseMode')


def convert_to_algebraic(index):
    """
    Converts board index (e.g., "60") to algebraic notation (e.g., "e2").
    """
    files = "abcdefgh"  # Columns on the chessboard
    rank = str(8 - (int(index) // 10))  # Convert row index to rank (1-8)
    file = files[int(index) % 10]  # Convert column index to file (a-h)
    return file + rank  # Return algebraic notation
