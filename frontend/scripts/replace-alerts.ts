import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/LENEVO/MAGRO/frontend/src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  if (content.includes('alert(')) {
    // 1. Import useToast if not present
    if (!content.includes('useToast')) {
      content = 'import { useToast } from "../components/ToastProvider";\n' + content;
    }
    
    // 2. Add const { showToast } = useToast(); inside the component
    if (!content.includes('showToast = useToast()')) {
      content = content.replace(/(export default function [A-Za-z0-9_]+\([^)]*\)\s*\{)/, '$1\n  const { showToast } = useToast();');
    }

    // 3. Replace alert(...) with showToast(..., type)
    content = content.replace(/alert\(([^)]+)\)/g, (match, p1) => {
      const type = (p1.toLowerCase().includes('erreur') || p1.toLowerCase().includes('obligatoire') || p1.toLowerCase().includes('volumineuse') || p1.toLowerCase().includes('escalation')) ? 'error' : 'success';
      return `showToast(${p1}, "${type}")`;
    });

    changed = true;
  }

  if (changed) {
    console.log("Updated", file);
    fs.writeFileSync(path.join(dir, file), content);
  }
}
