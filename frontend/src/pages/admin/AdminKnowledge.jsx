import React, { useState, useEffect } from 'react';
import { knowledgeApi } from '../../services/api';
import Modal from '../../components/Modal';
import { BookOpen, PlusCircle, Search, Edit3, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'LOGIN', 'PAYMENT', 'BILLING', 'ACCOUNT', 'TECHNICAL', 
  'BUG', 'FEATURE_REQUEST', 'PRODUCT', 'SERVICE', 'GENERAL'
];

export const AdminKnowledge = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const resp = await knowledgeApi.getArticles(params);
      setArticles(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('GENERAL');
    setKeywords('');
    setContent('');
    setModalOpen(true);
  };

  const openEditModal = (art) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setKeywords(art.keywords);
    setContent(art.content);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await knowledgeApi.updateArticle(editingId, { title, category, keywords, content });
      } else {
        await knowledgeApi.createArticle({ title, category, keywords, content });
      }
      setModalOpen(false);
      fetchArticles();
    } catch (err) {
      alert('Failed to save article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge article?')) return;
    try {
      await knowledgeApi.deleteArticle(id);
      fetchArticles();
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            Knowledge Base Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified reference solutions queried automatically by the Knowledge Agent
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Article
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
            placeholder="Search articles by title, keywords or content..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-brand-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-10 text-center text-xs text-slate-400">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400">No articles found.</div>
        ) : (
          articles.map((art) => (
            <div key={art.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(art)}
                      className="p-1 text-slate-400 hover:text-brand-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{art.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                  {art.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono block">
                  Keywords: {art.keywords}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Knowledge Article' : 'Create Knowledge Article'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Reset Password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keywords (Comma-separated)</label>
              <input
                type="text"
                required
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="password, auth, reset"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Solution Content</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed step-by-step resolution..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 shadow"
            >
              Save Article
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminKnowledge;
