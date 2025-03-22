const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'app', 'components', 'ui');

fs.readdirSync(componentsDir).forEach(file => {
    if (file.endsWith('.tsx')) {
        const filePath = path.join(componentsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace the import
        content = content.replace(
            'import { cn } from "@/lib/utils"',
            'import { cn } from "../../lib/utils"'
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
}); 