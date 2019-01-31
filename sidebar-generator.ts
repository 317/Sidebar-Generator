import * as fs from "fs-extra"

/*
 * Generation of file list
 */

var walkSync = function (dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
        } else {
            if (file.endsWith(".md") && !file.startsWith("./_")) {
                filelist.push(dir + file);
            }
        }
    });
    return filelist;
};

let filelist = [];
const dir = "./";
let files = fs.readdirSync(dir);
files.forEach(function (file) {
    if (!fs.statSync(dir + file).isDirectory() && file.endsWith(".md") && !file.startsWith("_")) {
        filelist.push(dir + file);
    }
});

walkSync("./docs/", filelist);

/*
 * Generation of sidebar
 */
const nav = "_sidebar.md";

// TODO: rendre tou ça récursif, pour que tous les fichiers d'un même dossier soient ensemble.
const addToNavbar = (line) => {
    // Ajouter le titre
    const file: string = fs.readFileSync(line, "utf8");
    const fileArr = file.split("\n");
    const firstLine = fileArr[0] != "" ? (fileArr[0].replace(/\#/gi, "").trim()) : (line.split("/")[line.split("/").length - 1]).substr(0, (line.split("/")[line.split("/").length - 1]).indexOf(".md"));
    fs.appendFileSync(nav, `-  [**${firstLine}**](${line})\n`)

    // Parcourir toutes les lignes, garder celles qui commencent par un hashtag et fabriquer les liens
    fileArr.shift();
    const links = [];
    for (const fileline of fileArr) {
        if (fileline.startsWith("\#")) {
            const nbHash = (fileline.match(/\#/g) || []).length;
            let hashes = "";
            let tabs = "";
            for (let i = 0; i < nbHash; i++) {
                hashes += "#";
                if (i > 0) {
                    tabs += "\t";
                }
            }
            const cleanedFileline = fileline.replace(/[^0-9a-z ]/gi, '').trim();

            let link = `${line}#${cleanedFileline.replace(/ /gi, "-")}`;
            const arrmaps = links.filter(otherLink => {
                if (otherLink === link || otherLink.match(/\-\d$/) && otherLink.startsWith(link)) {
                    return true;
                }
                return false;
            })

            if (arrmaps.length > 0) {
                link += "-" + arrmaps.length;

            }

            const append = `${tabs}- [${cleanedFileline}](${link})`.replace(/ /gi, " ");
            links.push(link);
            fs.appendFileSync(nav, append + "\n")
        }
    }
}

const initSidebar = (title) => {
    fs.removeSync(nav);
    fs.appendFileSync(nav, "- # **" + title + "**\n")
}


initSidebar("TEAM DOCUMENTATION");
for (const file of filelist) {
    addToNavbar(file);
}

