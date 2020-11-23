import {App, expressApp } from "./backup";

class ClassCommitteeApplication {
    private app: App;
    private port: number | string = process.env.PORT || 5000;

    constructor(app:App) {
        this.app = app;
    }

    main(){
        this.app.start(this.port)
    }
}

new ClassCommitteeApplication(expressApp).main();