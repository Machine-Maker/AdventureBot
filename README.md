TO-DO:
- ~~parse scenario files~~
- ~~Give/TakeExp~~
- ~~choice chains~~
- ~~links~~
- Actions (~~GiveExp~~, ~~TakeExp~~, ~~SetFlag~~, ~~DelFlag~~, ~~Death flag~~)
- ~~EndSession Link~~
- ~~accumulating Exp~~
- ~~health actions~~
- ~~levels~~
- damage increase/reduction
- ~~Link actions~~
- Link conditions
- Documentation (partial)
- custom colors
- Conditions from flags
- ~~persistent saving~~
- enemy encounters
- ~~invite system~~
- dev commands (partially complete)


# Last Oasis Choose Your Own Adventure
>This is the documentation for creating scenarios for the CYOA game.

## Base Format
The **FIRST** line of each `.txt` file must be the name of the scenario with the format `#Scenario Name`.  
*NOTE:* Spaces are **OK** in the name.

---
Next comes the `Start` stage of the scenario. Each and every scenario must have **ONE AND ONLY ONE** stage labeled `Start`. Labeling each stage is a simple as
```js
#Start
{
  //Stage details
}
```
Following stage names are formatting the same way (e.g. `#StageName`). It is good practice to keep those to a single word as they will not be visible on the front-end of the game.  
*NOTE:* Stage names **ARE** case-sensitive so keep that in mind.

---
After declaring a stage's name, you can begin formatting the stage. The following format just be pure **JSON**. A public parser will be made availible in the future.  
There are a couple **required** properties for each stage. They are `Title` and `Text`. `ImageURL` is recommended as much as possible to add to the aestetic of the stage.  
```json
#Start
{
  "Title": "Bandit Attack!",
  "Text": "You are jolted awake...",
  "ImageURL": "https://cdn.discordapp.com/attachments/561783688086683669/561783841178648606/start.png"
}
```
The above is an example of a **very** basic starting stage. If you want to have line breaks in your `Text`, use a `\` at the end of the line to signify a line break.
```json
{
  "Text": "This is line 1 \
  And this is line 2",
}
```

---
Every stage except Winning and Losing stages require the `Links` property. Every `Links` property requires `Command`, `Link`, and `Description`. The `Links` property must correspond to another stage's name. That is how the game knows where to go next with the story.
```json
#Start
{
  "Required": "properties omitted",
  "Links": [
    { "Command": "Fiber", "Link": "searchFiber", "Description": "Begin to search for fiber." },
    { "Command": "Back", "Link": "choices", "Description": "Go back." }
  ]
}
```
![example links](https://cdn.discordapp.com/attachments/515378594495594516/625428194291613757/unknown.png)

There is a special link called the `EndSession` link. This link is used to mark this stage as a winning stage. The game will end on this slide with a win result.
```json
#FinalStage
{
  **omitted_previous_properties**

  "Links": [{"EndSession": true}]
}
```
---
An optional property is the `Actions` property which takes an array of different actions from the list below.
* GiveExp (integer)
* TakeExp (integer)
* SetFlag (string)
* DelFlag (string)
```json
#OtherStage
{
  **omitted_previous_properties**

  "Actions": [
    {"SetFlag": "hasWeapon"},
    {"GiveExp": 300}
  ],
}

**Another Example**

#DeadStage
{
  "Actions": [
    {"SetFlag": "Dead"}
  ]
}
```
The `SetFlag` and `DelFlag` can be used with custom flags to store information about the current playthrough of the scenario.  

The `SetFlag` also has a built-in flag called `Dead`. Any stage with the action `{"SetFlag": "Dead"}` is considered a lose condition stage and the game will end there.  
