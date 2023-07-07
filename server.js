const express=require('express');
const app=express();
const cors=require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'coder',
      database : 'Detecting-Face-DB'
    }
  });

// knex.select('*').from('users').then(data => {
//     console.log(data);
// })

app.use(express.json()); 
app.use(cors());

// let database=[
//     {
//         id:'01',
//         name:'Asish',
//         email:'asish@gmail.com',
//         password:'coder',
//         entries:0,
//         joined: new Date()
//     },
//     {
//         id:'02',
//         name:'luffy',
//         email:'luffy@gmail.com',
//         password:'pirate',
//         entries:0,
//         joined: new Date()
//     }
// ]

app.get('/',(req,res)=>{
    res.json("database will be avalable");
})

app.post('/registor',(req,res)=>{
    // try out async approch also
    // bcrypt.genSalt(saltRounds, function(err, salt) {
    //     bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
    //     bchash=hash
    //     });
    // });
    // console.log(req.body)
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    knex('login')
    .returning('email')
    .insert({
        email:req.body.email,
        hash: hash
    })
    .then(loginemail => {
        knex('users')
        .returning('*')
        .insert({
            name:req.body.name,
            email:loginemail[0].email,
            joined: new Date()
        })
        .then(user => {
            res.json(user[0])
            // console.log('json user data'+JSON.stringify(user[0]));
            // console.log(user[0])
        })
        .catch(err => res.status(400).json('unable to registor'+ err.detail))
    })
    .catch(err => res.status(400).json('user already exit '+err.detail))
    // database.push({
    //     id:'03',
    //     name:req.body.name,
    //     password:req.body.password,
    //     email:req.body.email,
    //     entries:0,
    //     joined: new Date()
    //     })
    // console.log(database);
    
})

app.post('/signin',(req,res)=>{
    // console.log(req.body);
    knex('login').where({email: req.body.email})
    .then(data => {
        const isvalid= bcrypt.compareSync(req.body.password, data[0].hash);
        if(isvalid)
            {
                knex.select('*')
                .from('users')
                .where({email: req.body.email})
                .then(user => {
                    res.json(user[0])
                    // console.log('json user data'+ JSON.stringify(user[0]))
                    // console.log(user[0])
                })
                .catch(err => res.json('unable to fetch user'))
            }
        else
            {res.json('unable to fetch user')}
    })
    .catch(err => res.json(err.detail))
    // signedin=false
    // for(let i=0;i<database.length;i++)
    // {
    //     if(database[i].email===req.body.email && database[i].password===req.body.password)
    //         {
    //             signedin=true;
    //             res.json(database[i]);
    //         }

    // }
    // if(signedin===false)
    // {
    //     res.json('error signing in')
    // }
})

app.get('/profile/:id',(req,res)=>{
    const {id}=req.params;
    const found=false
    database.forEach((user)=>{
        if(user.id===id){
            res.json(user)
            found=true
        }
    })
    if(found===false){
        res.json('User Not Found')
    }
})

app.put('/image',(req,res)=>{
    const {id}=req.body;
    // let found=false
    knex('users')
    .where('id', '=', id)
    .returning('entries')
    .increment('entries', 1)
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json("unable to update entries"))
    // database.forEach((user)=>{
    //     if(user.id===id){
    //         user.entries++;
    //         res.json(user.entries)
    //         found=true
    //     }
    // })
    // if(found===false){
    //     res.json('User Not Found')
    // }
    
})

app.listen(process.env.PORT);