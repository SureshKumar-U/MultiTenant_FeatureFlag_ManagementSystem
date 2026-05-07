const app = require('./src/app');
const {PORT} = require('./src/config/env.config');
const connectToDB = require('./src/config/db.config');

connectToDB();
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}) 