import { useState, useEffect } from 'react';
import { X, Code, Play, Download, Settings, Copy } from 'lucide-react';

interface CodeEditorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    socket?: any;
    meetingId?: string;
}

export function CodeEditorPanel({ isOpen, onClose, socket, meetingId }: CodeEditorPanelProps) {
    const [code, setCode] = useState(`// Welcome to the Live Code Editor
// Start typing to collaborate...

function solveProblem(input) {
  // Your code here
  return input;
}

console.log(solveProblem("Hello World"));
`);

    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('javascript');

    // Simple mock execution
    const runCode = () => {
        setOutput('Running...');
        setTimeout(() => {
            setOutput('> Hello World\n> Execution finished in 0.2s');
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-gray-700 w-full md:w-[600px] transition-all duration-300">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Code size={18} />
                        <span className="font-bold text-sm">Code Editor</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#3c3c3c] text-xs text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                    >
                        <Play size={14} fill="currentColor" />
                        Run
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative font-mono text-sm">
                <div className="absolute inset-0 flex">
                    {/* Line Numbers (Mock) */}
                    <div className="w-10 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 select-none border-r border-gray-800 leading-6">
                        {[...Array(20)].map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Text Area */}
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 resize-none focus:outline-none leading-6 font-mono"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Terminal/Output */}
            <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
                    <button
                        onClick={() => setOutput('')}
                        className="text-xs text-gray-500 hover:text-white"
                    >
                        Clear
                    </button>
                </div>
                <div className="flex-1 p-3 font-mono text-xs text-gray-300 overflow-y-auto whitespace-pre-wrap">
                    {output || <span className="text-gray-600 italic">Output will appear here...</span>}
                </div>
            </div>
        </div>
    );
}
