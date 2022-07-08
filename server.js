const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const formatmsg=require('./utility/messages.js');
const {UserJoin, getCurrentUser, UserLeft, getRoomUsers}=require('./utility/users.js');
const app=express();
const server=http.createServer(app);
const io=socketio(server);
app.use(express.static(path.join(__dirname,'public')));

io.on('connection',(socket)=>
{  
     socket.on('joinRoom',({username,room})=>
{  
     const user=UserJoin(socket.id,username,room);
    socket.join(user.room);

    socket.emit('message',formatmsg('bot','welcome to RoomChat'));//message for single user
    socket.broadcast.to(user.room).emit('message',formatmsg('bot', `${user.username} has joined chat`));//message for everyone except user

    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room) 
    }); 
});   
    
    socket.on('chatMessage',(msg)=>
    {
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatmsg(user.username ,msg));
    })
    socket.on('disconnect',()=>
    {
        const user=UserLeft(socket.id);
        if(user)
        {
        io.to(user.room).emit('message',formatmsg('bot',`${user.username} has left chat`));
        
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }//message for all
        
    })
})

server.listen(3000);