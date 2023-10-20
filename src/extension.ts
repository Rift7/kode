import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.kode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            
            const prompt = await vscode.window.showInputBox({
                prompt: 'How would you like to change the code?'
            });

            if (prompt) {
                const newCode = await generateCodeWithOpenAI(prompt, code);
                
                if (newCode) {
                    editor.edit(editBuilder => {
                        const entireRange = new vscode.Range(document.positionAt(0), document.positionAt(code.length));
                        editBuilder.replace(entireRange, newCode);
                    });
                }
            }
        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    });

    context.subscriptions.push(disposable);
}

async function generateCodeWithOpenAI(prompt: string, code: string): Promise<string | null> {
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            prompt: `Modify the following code based on the instruction: "${prompt}"\n\n${code}\n`,
            max_tokens: 200
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer your-openai-api-key`
            }
        });

        const generatedText = response.data.choices[0].text.trim();
        return code + '\n' + generatedText;
    } catch (error) {
        console.error('Error generating code with OpenAI:', error);
        vscode.window.showErrorMessage('Failed to generate code.');
        return null;
    }
}

export function deactivate() {}
