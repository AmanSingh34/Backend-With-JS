import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

    app.use(express.json({limit:"16kb"}))
    app.use(express.urlencoded({extended:true,limit:"16kb"}))
    app.use(express.static("public"))
    app.use(cookieParser())


//Import Router
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import healthRouter from './routes/healthCheck.routes.js'
import TweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import commentsRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
//routes declaration 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/healthcheck",healthRouter)
app.use("/api/v1/tweet",TweetRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/comments",commentsRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/dashboard",dashboardRouter)


export {app}