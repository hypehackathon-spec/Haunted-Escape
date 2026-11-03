# Haunted Escape 
## what is it about

you are a little witch and you got trapped inside a haunted house (bad day). the only way out is the door but its LOCKED. to open it you have to find all the keys hidden around the house. the problem is the house is full of ghosts that float around and they will NOT let you walk past them easily. can you escape all 5 rooms?

## how to play

1. click or press space to start
2. move the witch around the maze:
   - **arrow keys** or **W A S D** on a keyboard
   - or **hold the mouse** (or your finger on a phone) and she walks towards it
3. walk over the shiny gold **keys** to pick them up. the top of the screen shows how many you have
4. when you got all of them the door turns green and says **EXIT**. run into it to finish the level!
5. watch out for the **ghosts**!! they float back and forth in a straight line (some go left and right and some go up and down). if one touches you, you lose a life and the level starts over
6. you only have **3 lives** for the whole game (the little pumpkins in the top right)
7. at the start of every level there is a "GET READY" thing where the ghosts dont move for a bit so you can look at the maze first
8. press **R** if you messed up and want to restart the level (it doesnt cost a life)
9. beat all 5 levels to win. it shows your time and your best time

tip: look at how the ghosts move for a few seconds before you go. they always follow the same path so once you know it you can sneak past. also the ghosts get faster every level so dont take too long 😭

## the levels

- **level 1:** 1 key, 1 ghost. super easy, its just to learn how it works
- **level 2:** 2 keys, 2 ghosts. the second key is in a hallway where a ghost goes up and down
- **level 3:** 3 keys, 2 ghosts. you have to go all the way around the house
- **level 4:** 4 keys, 4 ghosts. it starts getting hard here
- **level 5:** 5 keys, 5 ghosts. good luck lol

## how i made it

i used the Ghost Ship guide for the `state` variable idea (`'start'`, `'play'`, `'between'`, `'win'` and `'over'`) and the spooky colors. but this game is way different from the guide so i had to figure out a lot of stuff myself:

- **the levels:** this was the coolest part!! every level is a list of text like this:
  ```
  '#P.........#'
  ```
  `#` is a wall, `.` is floor, `P` is where the player starts, `K` is a key, `D` is the door and `H` or `V` is a ghost (H goes horizontal and V goes vertical). then a loop with `for` goes through every letter and draws the right thing. to make a new level you only need to change the letters!!
- **tiles:** the whole screen is made of squares that are 40 x 40 pixels. i use `floor(x / 40)` to figure out which square something is standing on
- **walls:** `isSolid()` checks if a square is a wall and `blocked()` checks all 4 corners of the player so she cant walk into walls. i move her left/right first and then up/down separately so she can slide along walls instead of getting stuck
- **ghosts:** they move in a straight line and when the next step would go into a wall they flip their direction by doing `dir = dir * -1`. the ghosts also get faster each level with `1.2 + levelNum * 0.25`
- **keys and the door:** i count the keys with `keysGot` and the door is solid until `keysGot` is the same as `totalKeys`. then it turns green and you can walk in
- **getting hit:** if `dist()` between the player and a ghost is less than 22 you lose a life and `loadLevel()` runs again to reset everything
- **timer:** i add `deltaTime / 1000` every frame while you are playing so it only counts when you are actually playing and not on the menu screens
- **drawing everything:** only basic shapes again. the witch is an ellipse face with a triangle hat, the keys bob up and down with `sin()`, the walls have a lighter top edge so they look 3D and the floor is a checkerboard
- **mobile:** if the mouse is held i use the distance from the witch to the mouse to figure out which way to walk

## things that went wrong

- the witch kept getting stuck on walls when i tried to walk diagonally. moving on the x and y separately fixed it
- at first the ghosts started moving right away and in level 5 one was right next to the player so you died in like 1 second. now there is the GET READY time
- i was scared a level was impossible so i made a little test that checks if every key and the door can be reached. they all worked!!
- the ghosts went through the door once, so now the door is always a wall for ghosts
- my first level 5 was way too hard so i took out a bunch of ghosts

## how to run it

**easy way:** open the link to the game and click

**p5.js editor way:**
1. go to [editor.p5js.org](https://editor.p5js.org/)
2. paste everything from `sketch.js` into the editor
3. press the play button



## credits
- made with [p5.js](https://p5js.org/)
- guide from [Ghost Ship](https://ghostship.hackclub.com/) by Hack Club
