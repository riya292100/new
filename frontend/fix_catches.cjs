const fs = require('fs');
const path = require('path');

function search(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            // Regex for matching `catch (err) { }` with possible spaces and comments inside
            const newContent = content.replace(/catch\s*\(([^)]+)\)\s*\{\s*(?:\/\/[^\n]*\s*)*\}/g, (match, p1) => {
                modified = true;
                return `catch (${p1}) { console.error('Error:', ${p1}); }`;
            });
            if (modified) {
                console.log(`Fixed in ${fullPath}`);
                fs.writeFileSync(fullPath, newContent);
            }
        }
    });
}
search('c:/Users/HP/Desktop/new/frontend/src');
