import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import { User } from "../models/modelUser.js";

//? body: means the information send in map data type at the time of making api call it will post or put request.
//? params: means the information send in dynamic url (included id) at the time of making api call.
//? current user or first person is req.body.userId

// update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // update user password
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        // update user details
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body, });
            res.status(200).json("Account information updated!");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You update on your account only.")
    }
});

// delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account deleted successfully!");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json('You can delete only your account!');
    }
})

// get user info
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId ? await User.findById(req.params.id):
            await User.findOne({ username: username });
        // remove getting some user information on api call
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const friends = await Promise.all(
        user.followings.map((friendId) => {
          return User.findById(friendId);
        })
      );
      let friendList = [];
      friends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });
      res.status(200).json(friendList)
    } catch (err) {
      res.status(500).json(err);
    }
  });

// followers and following
router.put("/:id/follow", async (req, res) => {
    // you can follow other user not yourself
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            // if userId not included in array then include onces.
            if (!user.followers.includes(req.body.userId)) {
                // first person id is in follower array to second user.
                await user.updateOne({ $push: { followers: req.body.userId } });
                // second person id is in first person following array.
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed!")
            } else {
                res.status(403).json("You already follow this User!")
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't follow yourself")
    }
})

// unfollowers and unfollowing
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            // if userId included in array then removes onces.
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("you dont follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
});


export default router;
