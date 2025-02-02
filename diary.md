Day 1:
Today I spent time brainstorming ideas for my retro-style shooter game and writing down a basic concept using concepts from my pitching bible. I made some rough sketches of the game layout and noted down the features I wanted, like different enemy types and destructible walls. I also started planning how I would organize the project files and folders.
________________________________________
Day 2:
I set up the project folder structure with separate directories for assets, game logic, objects, levels, and utilities. I created the basic index.html with a canvas element and simple overlay divs for the start, game over, and win screens. I also wrote some initial CSS in styles.css to style these elements.
________________________________________
Day 3:
I began working on the Game.js file and implemented the main Game class. I wrote a basic game loop using requestAnimationFrame that calculates delta time and calls update and draw functions. I also added event listeners for window resizing and mouse movements to ensure the canvas would adjust properly.
________________________________________
Day 4:
I created a base Entity class in object.js that defines common properties like position, width, height, and a basic draw method. Then I started on the Player class in player.js, extending from Entity and adding movement and collision logic. I tested the player’s movement on the canvas and made small adjustments based on what I observed.
________________________________________
Day 5:
I developed an Enemy class to handle simple enemy behavior, such as moving toward the player. I then started working on the ShootingEnemy class so that some enemies could fire bullets. I set up arrays in the Game class for storing enemies and made sure the enemy objects were created correctly.
________________________________________
Day 6:
Today I focused on creating the Bullet class, which included properties for speed, direction, and damage, as well as a method to update its position. I integrated bullet movement into the game loop and added basic collision detection for when bullets hit walls or enemies. I spent some time debugging the bullet behavior to ensure it worked as expected.
________________________________________
Day 7:
I worked on the Wall class to support both destructible and indestructible walls, adding a health property for the destructible ones. I wrote the level-loading code in levels/level1.js to create walls from a tile map. I tested how the player and enemies interacted with the walls and adjusted collision handling as needed.
________________________________________
Day 8:
Today I added some utility functions in collisions.js to check for collisions between bullets, enemies, and the player. I refined these collision checks to make sure they were accurate and responded properly when objects overlapped. I also tweaked enemy movement slightly so they would behave more naturally when chasing the player.
________________________________________
Day 9:
I integrated an AudioManager to load and play sound effects and background music for events like shooting and enemy deaths. I added a simple mute toggle that lets the player turn the sound on and off with a key press. I spent some time testing the audio to make sure it played at the right moments without causing errors.
________________________________________
Day 10:
I focused on overall debugging and cleaning up the code to ensure smooth gameplay and consistent performance. I made final adjustments to asset loading, scaling, and level transitions based on my tests. I documented my development process in this diary and prepared my presentation to explain how everything works.
