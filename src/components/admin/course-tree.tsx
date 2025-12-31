"use client"

import { useState } from 'react'
import { PlusIcon, PencilSquareIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface CourseTreeProps {
    courseId: string
    chapters: any[]
    onUpdate: () => void
}

export function CourseTree({ courseId, chapters, onUpdate }: CourseTreeProps) {
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
    const [editingNode, setEditingNode] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'CHAPTER' | 'LESSON'>('CHAPTER')
    const [parentNodeId, setParentNodeId] = useState<string | null>(null)

    const toggleChapter = (id: string) => {
        const newExpanded = new Set(expandedChapters)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedChapters(newExpanded)
    }

    const openModal = (type: 'CHAPTER' | 'LESSON', parentId?: string, editData?: any) => {
        setModalType(type)
        setParentNodeId(parentId || null)
        setEditingNode(editData || null)
        setIsModalOpen(true)
    }

    const deleteNode = async (type: 'CHAPTER' | 'LESSON', id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        const endpoint = type === 'CHAPTER' ? '/api/admin/chapters' : '/api/admin/lessons'
        try {
            await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' })
            onUpdate()
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Content Structure</h3>
                <button
                    onClick={() => openModal('CHAPTER', courseId)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Chapter
                </button>
            </div>

            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleChapter(chapter.id)}>
                                {expandedChapters.has(chapter.id) ? (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                                ) : (
                                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                                )}
                                <span className="font-medium text-gray-900">
                                    {chapter.title?.en || 'Untitled'} / {chapter.title?.de || 'Untitled'}
                                </span>
                                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                                    {chapter.lessons?.length || 0} lessons
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => openModal('LESSON', chapter.id)}
                                    className="p-1 text-gray-400 hover:text-blue-500"
                                    title="Add Lesson"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => openModal('CHAPTER', courseId, chapter)}
                                    className="p-1 text-gray-400 hover:text-gray-500"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => deleteNode('CHAPTER', chapter.id)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {expandedChapters.has(chapter.id) && (
                            <div className="border-t border-gray-200 divide-y divide-gray-200">
                                {chapter.lessons?.map((lesson: any) => (
                                    <div key={lesson.id} className="pl-12 pr-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50">
                                        <div>
                                            <span className="text-sm text-gray-900">
                                                {lesson.title?.en || 'Untitled'} / {lesson.title?.de || 'Untitled'}
                                            </span>
                                            {lesson.isPublished && (
                                                <span className="ml-2 text-xs text-green-600 font-medium">Published</span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openModal('LESSON', chapter.id, lesson)}
                                                className="p-1 text-gray-400 hover:text-gray-500"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteNode('LESSON', lesson.id)}
                                                className="p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!chapter.lessons || chapter.lessons.length === 0) && (
                                    <div className="pl-12 py-3 text-sm text-gray-500 italic">
                                        No lessons in this chapter
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <NodeModal
                    type={modalType}
                    parentId={parentNodeId}
                    initialData={editingNode}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        setIsModalOpen(false)
                        onUpdate()
                    }}
                />
            )}
        </div>
    )
}

function NodeModal({ type, parentId, initialData, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        title: {
            en: initialData?.title?.en || '',
            de: initialData?.title?.de || ''
        },
        description: {
            en: initialData?.description?.en || '',
            de: initialData?.description?.de || ''
        },
        order: initialData?.order || 0,
        isPublished: initialData?.isPublished || false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const endpoint = type === 'CHAPTER' ? '/api/admin/chapters' : '/api/admin/lessons'
        const method = initialData ? 'PUT' : 'POST'

        const body: any = { ...formData, id: initialData?.id }
        if (type === 'CHAPTER' && !initialData) body.courseId = parentId
        if (type === 'LESSON' && !initialData) body.chapterId = parentId

        try {
            await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            onSave()
        } catch (error) {
            console.error('Save failed:', error)
            alert('Failed to save')
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">
                    {initialData ? 'Edit' : 'New'} {type === 'CHAPTER' ? 'Chapter' : 'Lesson'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title (EN)</label>
                        <input
                            type="text"
                            required
                            value={formData.title.en}
                            onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title (DE)</label>
                        <input
                            type="text"
                            required
                            value={formData.title.de}
                            onChange={e => setFormData({ ...formData, title: { ...formData.title, de: e.target.value } })}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Published</label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
