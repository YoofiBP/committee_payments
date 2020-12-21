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
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Gideon Larmie";
    workbook.created = new Date();
    const sheet:any = workbook.addWorksheet('Contributions')
    sheet.columns = [
        {header: 'Name', key: 'name'},
        {header: 'Amount', key: 'amount'},
    ]
    const contributions = await ContributionModel.find({eventId}).populate('contributorId',['name','phoneNumber']).populate('eventId','name')
    contributions.forEach(contribution => {
        sheet.addRow({name:(contribution.contributorId as IUser).name, amount: contribution.amount})
    })
    workbook.xlsx.writeFile(`${(contributions[0].eventId as IEvent).name} contributions.xlsx`).then(() => {
        console.log("Report Done")
    }).catch(err => console.log(err))
}

generateContributionReport("5fdb98726508845333fc5cfb").then(() => {console.log("Done")})



