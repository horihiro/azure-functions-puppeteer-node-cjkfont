import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as puppeteer from "puppeteer"
import * as util from "util"
import { promises as fs }  from "fs"
import * as glob from "glob-promise"
import { exec } from "child_process"

const execAsync = util.promisify(exec);

const fontUpdate = async () => {
    try {
        await fs.stat('/home/.fonts');
        return
    } catch {
    }

    // mkdir ~/.fonts
    await fs.mkdir("/home/.fonts");

    // cp /home/site/wwwroot/fonts/* ~/.fonts
    const fonts = await glob("/home/site/wwwroot/fonts/*.otf");
    await fonts.reduce((previousState, currentValue) => {
        return previousState.then(() => {
            const fontfile = currentValue.replace(/.*\/([^/]+)/, '$1')
            return fs.copyFile(currentValue, `/home/.fonts/${fontfile}`);
        })
    }, Promise.resolve());

    // fc-cache -fv
    await execAsync("fc-cache -fv");
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const url = req.query.url || "https://example.com";

    try {
        await fontUpdate();

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
        await page.emulateMediaType('screen');
        const body = await page.screenshot({type: 'png'});
        browser.close();

        context.res = {
            // status: 200, /* Defaults to 200 */
            headers: {
                "Content-Type": "image/png"
            },
            body
        };
    } catch (e) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: e.toString()
        };
    }
};

export default httpTrigger;