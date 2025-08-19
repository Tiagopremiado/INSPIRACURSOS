import React, { useState, useEffect, useMemo } from 'react';
import { Folder, Note } from '../types';
import { FolderIcon, DocumentTextIcon, PlusIcon, TrashIcon, CheckCircleIcon } from './icons';

const STORAGE_KEY = 'student-notes-data';

const NotesWidget: React.FC = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [noteContent, setNoteContent] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if(parsedData.folders) {
                    setFolders(parsedData.folders);
                }
            }
        } catch (error) {
            console.error("Failed to load notes from localStorage", error);
            setFolders([]);
        }
    }, []);

    const activeFolder = useMemo(() => folders.find(f => f.id === activeFolderId), [folders, activeFolderId]);
    const activeNote = useMemo(() => activeFolder?.notes.find(n => n.id === activeNoteId), [activeFolder, activeNoteId]);

    useEffect(() => {
        if (activeNote) {
            setNoteContent(activeNote.content);
        } else {
            setNoteContent('');
        }
    }, [activeNote]);

    const saveDataToLocalStorage = (data: { folders: Folder[] }) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder: Folder = {
            id: `folder-${Date.now()}`,
            name: newFolderName.trim(),
            notes: [],
        };
        const updatedFolders = [...folders, newFolder];
        setFolders(updatedFolders);
        saveDataToLocalStorage({ folders: updatedFolders });
        setNewFolderName('');
        setActiveFolderId(newFolder.id);
        setActiveNoteId(null);
    };
    
    const handleDeleteFolder = (folderId: string) => {
        if(window.confirm('Tem certeza que quer deletar esta pasta e todas as suas anotações?')) {
            const updatedFolders = folders.filter(f => f.id !== folderId);
            setFolders(updatedFolders);
            saveDataToLocalStorage({ folders: updatedFolders });
            if(activeFolderId === folderId) {
                setActiveFolderId(null);
                setActiveNoteId(null);
            }
        }
    }

    const handleCreateNote = () => {
        if (!newNoteTitle.trim() || !activeFolderId) return;
        const newNote: Note = {
            id: `note-${Date.now()}`,
            title: newNoteTitle.trim(),
            content: '',
            lastSaved: new Date().toISOString(),
        };
        const updatedFolders = folders.map(folder => {
            if (folder.id === activeFolderId) {
                return { ...folder, notes: [...folder.notes, newNote] };
            }
            return folder;
        });
        setFolders(updatedFolders);
        saveDataToLocalStorage({ folders: updatedFolders });
        setNewNoteTitle('');
        setActiveNoteId(newNote.id);
    };

    const handleDeleteNote = (noteId: string) => {
        if(!activeFolderId || !window.confirm('Tem certeza que quer deletar esta anotação?')) return;
        const updatedFolders = folders.map(folder => {
            if (folder.id === activeFolderId) {
                return { ...folder, notes: folder.notes.filter(n => n.id !== noteId) };
            }
            return folder;
        });
        setFolders(updatedFolders);
        saveDataToLocalStorage({ folders: updatedFolders });
        if(activeNoteId === noteId) {
            setActiveNoteId(null);
        }
    }

    const handleSaveNote = () => {
        if (!activeFolderId || !activeNoteId) return;
        const updatedFolders = folders.map(folder => {
            if (folder.id === activeFolderId) {
                return {
                    ...folder,
                    notes: folder.notes.map(note =>
                        note.id === activeNoteId
                            ? { ...note, content: noteContent, lastSaved: new Date().toISOString() }
                            : note
                    ),
                };
            }
            return folder;
        });
        setFolders(updatedFolders);
        saveDataToLocalStorage({ folders: updatedFolders });
        setSaveStatus({ visible: true, message: `Salvo em ${new Date().toLocaleTimeString()}` });
        setTimeout(() => setSaveStatus({ visible: false, message: '' }), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bloco de Anotações Avançado</h2>
            <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
                {/* Sidebar */}
                <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col">
                    <h3 className="font-bold text-lg mb-3">Pastas</h3>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Nova pasta..."
                            className="flex-grow w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                        <button onClick={handleCreateFolder} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"><PlusIcon className="h-4 w-4"/></button>
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-grow">
                        {folders.map(folder => (
                            <div key={folder.id} className={`group flex justify-between items-center p-2 rounded-md cursor-pointer ${activeFolderId === folder.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`} onClick={() => { setActiveFolderId(folder.id); setActiveNoteId(null); }}>
                                <div className="flex items-center">
                                    <FolderIcon className="h-5 w-5 mr-2"/>
                                    <span className="font-semibold text-sm">{folder.name}</span>
                                </div>
                                <button onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder.id)}} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                    
                    {activeFolder && (
                         <div className="mt-4 pt-4 border-t">
                             <h3 className="font-bold text-lg mb-3">Anotações em "{activeFolder.name}"</h3>
                             <div className="flex gap-2 mb-3">
                                <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Nova anotação..." className="flex-grow w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"/>
                                <button onClick={handleCreateNote} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"><PlusIcon className="h-4 w-4"/></button>
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-40">
                                {activeFolder.notes.map(note => (
                                     <div key={note.id} className={`group flex justify-between items-center p-2 rounded-md cursor-pointer ${activeNoteId === note.id ? 'bg-green-100 text-green-900' : 'hover:bg-gray-200'}`} onClick={() => setActiveNoteId(note.id)}>
                                        <div className="flex items-center">
                                            <DocumentTextIcon className="h-5 w-5 mr-2"/>
                                            <span className="text-sm">{note.title}</span>
                                        </div>
                                         <button onClick={(e) => {e.stopPropagation(); handleDeleteNote(note.id)}} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                                     </div>
                                ))}
                            </div>
                         </div>
                    )}
                </div>

                {/* Editor */}
                <div className="md:w-2/3 flex flex-col">
                    {activeNote ? (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{activeNote.title}</h3>
                                <div className={`flex items-center text-green-600 transition-opacity duration-300 ${saveStatus.visible ? 'opacity-100' : 'opacity-0'}`}>
                                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                                    <span className="text-sm font-semibold">{saveStatus.message}</span>
                                </div>
                            </div>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Comece a escrever suas anotações aqui..."
                                className="w-full flex-grow p-4 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="mt-4 flex justify-end items-center">
                               <p className="text-xs text-gray-500 mr-4">Última atualização: {new Date(activeNote.lastSaved).toLocaleString()}</p>
                               <button onClick={handleSaveNote} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                    Salvar Anotações
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col justify-center items-center text-center bg-gray-50 rounded-lg border-2 border-dashed">
                            <h3 className="text-xl font-semibold text-gray-600">Selecione uma pasta e uma anotação</h3>
                            <p className="text-gray-500 mt-2">Ou crie uma nova pasta para começar a organizar suas ideias.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesWidget;
