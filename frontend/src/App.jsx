import { useCallback, useEffect, useMemo, useState } from 'react';

const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_URL = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`;
const emptyBook = {
  bookId: '',
  title: '',
  author: '',
  category: '',
  publisher: '',
  publishYear: '',
  isbn: '',
  quantity: 0,
  description: ''
};

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(body?.message || `Yêu cầu thất bại (${response.status})`);
  }
  return body;
}

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = useCallback(async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const query = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : '';
      setBooks(await request(`/books${query}`));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadBooks(search), 250);
    return () => clearTimeout(timer);
  }, [loadBooks, search]);

  const formTitle = useMemo(() => (editingBook ? 'Cập nhật sách' : 'Thêm sách mới'), [editingBook]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.publishYear = Number(payload.publishYear);
    payload.quantity = Number(payload.quantity);

    try {
      if (editingBook) {
        await request(`/books/${editingBook._id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setNotice('Cập nhật sách thành công.');
      } else {
        await request('/books', { method: 'POST', body: JSON.stringify(payload) });
        setNotice('Thêm sách thành công.');
      }
      setEditingBook(null);
      event.currentTarget.reset();
      await loadBooks(search);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    if (!window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      await request(`/books/${book._id}`, { method: 'DELETE' });
      setNotice('Xóa sách thành công.');
      if (selectedBook?._id === book._id) setSelectedBook(null);
      await loadBooks(search);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startEditing(book) {
    setSelectedBook(null);
    setEditingBook(book);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">THƯ VIỆN SỐ</p>
          <h1>Quản lý sách</h1>
          <p className="hero-copy">Theo dõi danh mục, cập nhật thông tin và tìm kiếm sách nhanh chóng.</p>
        </div>
        <div className="book-count"><strong>{books.length}</strong><span>đầu sách</span></div>
      </header>

      {error && <div className="alert error" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
      {notice && <div className="alert success" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}

      <section className="content-grid">
        <form key={editingBook?._id || 'new'} className="panel book-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div><p className="eyebrow">THÔNG TIN</p><h2>{formTitle}</h2></div>
            {editingBook && <button type="button" className="text-button" onClick={() => setEditingBook(null)}>Hủy sửa</button>}
          </div>
          <div className="form-grid">
            <Field label="Mã sách" name="bookId" defaultValue={editingBook?.bookId || ''} required />
            <Field label="Tên sách" name="title" defaultValue={editingBook?.title || ''} required />
            <Field label="Tác giả" name="author" defaultValue={editingBook?.author || ''} required />
            <Field label="Thể loại" name="category" defaultValue={editingBook?.category || ''} required />
            <Field label="Nhà xuất bản" name="publisher" defaultValue={editingBook?.publisher || ''} required />
            <Field label="Năm xuất bản" name="publishYear" type="number" min="0" defaultValue={editingBook?.publishYear || ''} required />
            <Field label="ISBN" name="isbn" defaultValue={editingBook?.isbn || ''} required />
            <Field label="Số lượng" name="quantity" type="number" min="0" defaultValue={editingBook?.quantity ?? 0} required />
          </div>
          <label className="field full-width">Mô tả<textarea name="description" rows="3" defaultValue={editingBook?.description || ''} /></label>
          <button className="primary-button" disabled={saving}>{saving ? 'Đang lưu...' : editingBook ? 'Lưu thay đổi' : 'Thêm sách'}</button>
        </form>

        <section className="panel catalog-panel">
          <div className="catalog-heading">
            <div><p className="eyebrow">DANH MỤC</p><h2>Danh sách sách</h2></div>
            <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, tác giả, thể loại..." /></label>
          </div>
          {loading ? <div className="state"><span className="spinner" />Đang tải danh sách...</div> : books.length === 0 ? <div className="state empty">Không tìm thấy sách phù hợp.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Sách</th><th>Tác giả</th><th>Thể loại</th><th>SL</th><th>Thao tác</th></tr></thead>
                <tbody>{books.map((book) => (
                  <tr key={book._id}>
                    <td><button className="book-title" onClick={() => setSelectedBook(book)}>{book.title}</button><small>{book.bookId}</small></td>
                    <td>{book.author}</td><td><span className="tag">{book.category}</span></td><td>{book.quantity}</td>
                    <td className="actions"><button onClick={() => setSelectedBook(book)} aria-label={`Xem ${book.title}`}>Xem</button><button onClick={() => startEditing(book)}>Sửa</button><button className="danger-text" onClick={() => handleDelete(book)}>Xóa</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {selectedBook && <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} onEdit={() => startEditing(selectedBook)} />}
    </main>
  );
}

function Field({ label, name, type = 'text', ...props }) {
  return <label className="field"><span>{label}</span><input name={name} type={type} {...props} /></label>;
}

function BookDetails({ book, onClose, onEdit }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="modal" role="dialog" aria-modal="true" aria-labelledby="book-detail-title">
      <button className="modal-close" onClick={onClose} aria-label="Đóng">×</button>
      <p className="eyebrow">CHI TIẾT SÁCH</p><h2 id="book-detail-title">{book.title}</h2><p className="modal-author">{book.author} · {book.publishYear}</p>
      <div className="detail-grid"><Detail label="Mã sách" value={book.bookId} /><Detail label="ISBN" value={book.isbn} /><Detail label="Thể loại" value={book.category} /><Detail label="Nhà xuất bản" value={book.publisher} /><Detail label="Số lượng" value={book.quantity} /></div>
      {book.description && <div className="description"><strong>Mô tả</strong><p>{book.description}</p></div>}
      <button className="primary-button" onClick={onEdit}>Chỉnh sửa sách</button>
    </article>
  </div>;
}

function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

export default App;
