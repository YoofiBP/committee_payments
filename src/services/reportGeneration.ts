import ExcelJS from 'exceljs'
import {ContributionModel} from "../models/ContributionModel";
import {DB, mongoDatabase} from "../db/Database";
import {IUser} from "../models/UserModel";
import {IEvent} from "../models/EventModel";

export const db:DB = mongoDatabase;

db.setConnectionVariables(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
});

db.connect();

const generateContributionReport = async (eventId:string) => {

    // Stays the same relatively => Document set up
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Gideon Larmie";
    workbook.created = new Date();
    const sheet:any = workbook.addWorksheet('Contributions')

    // Column Header Set up
    sheet.columns = [
        {header: 'Name', key: 'name'},
        {header: 'Amount', key: 'amount'},
    ]

    // Data Fetching
    const contributions = await ContributionModel.find({eventInfo: eventId}).populate('contributorId',['name','phoneNumber']).populate('eventId','name')

    //Data Writing and Saving
    contributions.forEach(contribution => {
        sheet.addRow({name:(contribution.contributorInfo as IUser).name, amount: contribution.amount})
    })
    workbook.xlsx.writeFile(`${(contributions[0].eventInfo as IEvent).name} contributions.xlsx`).then(() => {
        console.log("Report Done")
    }).catch(err => console.log(err))
}

generateContributionReport("5fdb98726508845333fc5cfb").then(() => {console.log("Done")})

abstract class ExcelReportGenerator {
    abstract getData(...args);
    abstract createFile(filename:string)
    abstract writeData(data)
    abstract setHeaders(headers:string[])

    createReport() {
        const data = this.getData();
        this.writeData(data)
        this.createFile('newFile')
    }
}

class EventReportGenerator extends ExcelReportGenerator {
    getData(eventId:string) {
        return ContributionModel.find({eventInfo: eventId}).populate('contributorId',['name','phoneNumber']).populate('eventId','name')
    }

    writeData(data) {
    }

    createFile() {

    }

    setHeaders(headers: string[]) {
    }
}


/*

Report showing contributions made per event
Report showing contributions made per individual
Report showing all contributions and amounts
Report showing all users and their total contributions

What changes

Resource ID
Resource Data and Headers
Report Type => Specified

Resource, filter by, join on contributions

User:
    Name
    Email
    Phone Number
    Total Contributions

Event:
    Name
    Venue
    Total Contribution

Contribution:
    Contributor
    Amount
    Event

generateReport(model, fields: Array<string>, filter: object)

All Users and their contributions => Model: User  Select/Fields: [Name, Total Contribution]
All contributions for a specific event => Model: Contribution Select/Fields: [Contributor Name, Contributor Phone Number, Amount, Event Name] Filter: Event ID
All contributions and amounts => Model: Contribution Select/Fields: [Contributor Name, Contributor Phone Number, Amount, Event Name]
All contributions per individual => Model Contribution Select/Fields: [Contributor Name, Contributor Phone Number, Amount, Event Name] Filter: Contributor ID

 */


