require('babel-register')({
    "presets": ["es2015"]
});
import app from "./app";

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})