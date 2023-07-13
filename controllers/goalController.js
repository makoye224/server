const asyncHandler = require("express-async-handler")
const Goal = require("../models/goalModel")
const User = require("../models/userModel")
// @desc Get goal
//@route GET/api/goals
//@access Private
const getGoals = asyncHandler(async(req, res) => {
    const goals = await Goal.find({user: req.user.id})
    res.status(200).json(goals)
})

// @desc Get all goals
//@route GET/api/goals/all
//@access private
const getAllGoals = asyncHandler(async(req, res) => {
    const goals = await Goal.find({})
    res.status(200).json(goals)
    return goals
})

// @desc Set goal
//@route POST/api/goals
//@access private
const setGoals = asyncHandler(async(req, res) => {
    if(!req.body.name || !req.body.price || !req.body.description
        ||!req.body.photo ){
        res.status(400)
        throw new Error("please add all fields")
    }
    const goal = await Goal.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        photo: req.body.photo,
        video:req.body.video,
        user: req.user.id, 
    })
    console.log(`success`)
    res.status(200).json(goal)
})

// @desc Update goal
//@route PUT/api/goals/:id
//@access Private
const updateGoals = asyncHandler(async(req, res) => {
    const goal = await Goal.findById(req.params.id)

    if(!goal){
        res.status(400)
        throw new Error("Plan not found")
    }

   
    //check for user 
    if(!req.user){
        res.status(401)
        throw new Error("User not found")
    }
    //make sure the login user match the foal user
    if(goal.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User not Authorized")
    }
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).json(updatedGoal)
})

// @desc Delete goal
//@route DELETE/api/goals/:id
//@access Private
const deleteGoals = asyncHandler(async(req, res) => {
    const result = await Goal.deleteMany()
    if(result.deletedCount === 0){
        res.status(400)
        throw new Error("Failed to delete all goals")
    }
    res.status(200).json({message: "All goals deleted successfully"})
})

/*
// @desc Delete goal
//@route DELETE/api/goals/:id
//@access Private
const deleteOneGoals = asyncHandler(async(req, res) => {
    const goal = await Goal.findById(req.params.id)
    if(!goal){
        res.status(400)
        throw new Error("Plan not found")
    }
   
    //check for user 
    if(!req.user){
        res.status(401)
        throw new Error("User not found")
    }
    //make sure the login user match the foal user
    if(goal.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User not Authorized")
    }
    
    await goal.deleteOne();
    res.status(200).json({id: req.params.id})
})*/

module.exports = {
    getGoals, setGoals, updateGoals, deleteGoals, getAllGoals
}