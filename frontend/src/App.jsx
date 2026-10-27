import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { 
  Heart, 
  Feather, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Hash, 
  Trash2, 
  Edit3, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { api, setToken, getToken } from './api';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=10b981&color=fff&name=User";

const getAvatarUrl = (userOrAuthor) => {
  if (userOrAuthor?.image && !userOrAuthor.image.includes('smiley-cyrus.jpeg')) {
    return userOrAuthor.image;
  }
  const name = userOrAuthor?.username || 'User';
  return `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(name)}`;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const parseHash = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/article/')) {
      return { name: 'article', params: { slug: hash.replace('#/article/', '') } };
    }
    if (hash === '#/editor') return { name: 'editor', params: {} };
    if (hash === '#/login') return { name: 'login', params: {} };
    if (hash === '#/register') return { name: 'register', params: {} };
    if (hash === '#/settings') return { name: 'settings', params: {} };
    if (hash.startsWith('#/profile/')) {
      return { name: 'profile', params: { username: decodeURIComponent(hash.replace('#/profile/', '')) } };
    }
    return { name: 'home', params: {} };
  };

  const [route, setRoute] = useState(parseHash);
  const [loadingUser, setLoadingUser] = useState(true);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize Auth
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.getCurrentUser()
        .then(res => setCurrentUser(res.user))
        .catch(() => setToken(null))
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const navigate = (name, params = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRoute({ name, params });
    if (name === 'home') {
      window.location.hash = '';
    } else if (name === 'article') {
      window.location.hash = `#/article/${params.slug}`;
    } else if (name === 'profile') {
      window.location.hash = `#/profile/${params.username}`;
    } else {
      window.location.hash = `#/${name}`;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    navigate('home');
  };

  if (loadingUser) {
    return (
      <div className="app-container">
        <div className="spinner" style={{ marginTop: '20vh' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
            <Feather size={26} color="#10b981" />
            <span>conduit</span>
            <span className="brand-badge">FastAPI</span>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-item ${route.name === 'home' ? 'active' : ''}`}
              onClick={() => navigate('home')}
            >
              Home
            </button>

            {currentUser ? (
              <>
                <button 
                  className={`nav-item ${route.name === 'editor' && !route.params.slug ? 'active' : ''}`}
                  onClick={() => navigate('editor')}
                >
                  <PlusCircle size={17} />
                  New Article
                </button>
                <button 
                  className={`nav-item ${route.name === 'settings' ? 'active' : ''}`}
                  onClick={() => navigate('settings')}
                >
                  <SettingsIcon size={17} />
                  Settings
                </button>
                <button 
                  className={`nav-item ${route.name === 'profile' && route.params.username === currentUser.username ? 'active' : ''}`}
                  onClick={() => navigate('profile', { username: currentUser.username })}
                >
                  <img 
                    src={getAvatarUrl(currentUser)} 
                    alt={currentUser.username} 
                    className="nav-avatar"
                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  />
                  <span>{currentUser.username}</span>
                </button>
                <button className="nav-item" onClick={handleLogout} title="Log Out">
                  <LogOut size={17} color="#ef4444" />
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`nav-item ${route.name === 'login' ? 'active' : ''}`}
                  onClick={() => navigate('login')}
                >
                  <LogIn size={17} />
                  Sign in
                </button>
                <button 
                  className={`nav-item ${route.name === 'register' ? 'active' : ''}`}
                  onClick={() => navigate('register')}
                >
                  <UserPlus size={17} />
                  Sign up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Router */}
      <main>
        {route.name === 'home' && (
          <HomeView currentUser={currentUser} navigate={navigate} />
        )}
        {route.name === 'article' && (
          <ArticleDetailView 
            slug={route.params.slug} 
            currentUser={currentUser} 
            navigate={navigate} 
          />
        )}
        {route.name === 'editor' && (
          <EditorView 
            slug={route.params.slug} 
            currentUser={currentUser} 
            navigate={navigate} 
          />
        )}
        {route.name === 'login' && (
          <AuthView isRegister={false} onAuthSuccess={(user) => { setCurrentUser(user); navigate('home'); }} navigate={navigate} />
        )}
        {route.name === 'register' && (
          <AuthView isRegister={true} onAuthSuccess={(user) => { setCurrentUser(user); navigate('home'); }} navigate={navigate} />
        )}
        {route.name === 'settings' && (
          <SettingsView currentUser={currentUser} onUpdate={(user) => setCurrentUser(user)} onLogout={handleLogout} />
        )}
        {route.name === 'profile' && (
          <ProfileView 
            username={route.params.username} 
            currentUser={currentUser} 
            navigate={navigate} 
          />
        )}
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// HOME VIEW
// -----------------------------------------------------------------------------
function HomeView({ currentUser, navigate }) {
  const [tab, setTab] = useState(currentUser ? 'feed' : 'global');
  const [selectedTag, setSelectedTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tags
  useEffect(() => {
    api.getTags().then(res => setTags(res.tags)).catch(() => {});
  }, []);

  // Load articles based on tab/tag
  const fetchArticles = () => {
    setLoading(true);
    let promise;
    if (selectedTag) {
      promise = api.getArticles({ tag: selectedTag });
    } else if (tab === 'feed' && currentUser) {
      promise = api.getFeed();
    } else {
      promise = api.getArticles();
    }

    promise
      .then(res => setArticles(res.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [tab, selectedTag]);

  const handleToggleFavorite = async (article) => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    const isFav = article.favorited;
    // Optimistic UI update
    setArticles(prev => prev.map(a => {
      if (a.slug === article.slug) {
        return {
          ...a,
          favorited: !isFav,
          favoritesCount: isFav ? a.favoritesCount - 1 : a.favoritesCount + 1,
        };
      }
      return a;
    }));

    try {
      if (isFav) {
        await api.unfavoriteArticle(article.slug);
      } else {
        await api.favoriteArticle(article.slug);
      }
    } catch {
      // Revert if error
      fetchArticles();
    }
  };

  return (
    <div>
      {!currentUser && (
        <section className="hero-banner">
          <h1 className="hero-title">conduit</h1>
          <p className="hero-subtitle">
            A real-world knowledge sharing platform powered by FastAPI & React.
          </p>
        </section>
      )}

      <div className="main-content">
        <div className="feed-layout">
          <div>
            <div className="tabs-nav">
              {currentUser && (
                <button 
                  className={`tab-btn ${tab === 'feed' && !selectedTag ? 'active' : ''}`}
                  onClick={() => { setSelectedTag(null); setTab('feed'); }}
                >
                  Your Feed
                </button>
              )}
              <button 
                className={`tab-btn ${tab === 'global' && !selectedTag ? 'active' : ''}`}
                onClick={() => { setSelectedTag(null); setTab('global'); }}
              >
                Global Feed
              </button>
              {selectedTag && (
                <button className="tab-btn active">
                  #{selectedTag}
                </button>
              )}
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : articles.length === 0 ? (
              <div className="empty-state">
                <p>No articles are here... yet.</p>
              </div>
            ) : (
              articles.map(article => (
                <article key={article.slug} className="article-card">
                  <header className="article-header">
                    <div 
                      className="author-meta" 
                      onClick={() => navigate('profile', { username: article.author.username })}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={getAvatarUrl(article.author)} 
                        alt={article.author.username} 
                        className="author-img"
                        onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                      />
                      <div className="author-info">
                        <h4>{article.author.username}</h4>
                        <time>{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                      </div>
                    </div>

                    <button 
                      className={`fav-btn ${article.favorited ? 'favorited' : ''}`}
                      onClick={() => handleToggleFavorite(article)}
                    >
                      <Heart size={15} fill={article.favorited ? "currentColor" : "none"} />
                      <span>{article.favoritesCount}</span>
                    </button>
                  </header>

                  <div 
                    className="article-body-preview"
                    onClick={() => navigate('article', { slug: article.slug })}
                  >
                    <h2 className="article-title">{article.title}</h2>
                    <p className="article-desc">{article.description}</p>
                  </div>

                  <footer className="article-footer">
                    <button 
                      className="read-more"
                      onClick={() => navigate('article', { slug: article.slug })}
                    >
                      Read more <ChevronRight size={14} />
                    </button>
                    <div className="tags-list">
                      {article.tagList?.map(tag => (
                        <span 
                          key={tag} 
                          className="tag-badge"
                          onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </footer>
                </article>
              ))
            )}
          </div>

          <aside>
            <div className="sidebar-widget">
              <h3 className="sidebar-title">
                <Hash size={18} color="#10b981" />
                Popular Tags
              </h3>
              {tags.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tags available</p>
              ) : (
                <div className="tags-list">
                  {tags.map(tag => (
                    <button 
                      key={tag} 
                      className="tag-badge"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ARTICLE DETAIL VIEW
// -----------------------------------------------------------------------------
function ArticleDetailView({ slug, currentUser, navigate }) {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getArticle(slug), api.getComments(slug)])
      .then(([artRes, comRes]) => {
        setArticle(artRes.article);
        setComments(comRes.comments || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleFavorite = async () => {
    if (!currentUser) return navigate('login');
    try {
      if (article.favorited) {
        const res = await api.unfavoriteArticle(slug);
        setArticle(res.article);
      } else {
        const res = await api.favoriteArticle(slug);
        setArticle(res.article);
      }
    } catch {}
  };

  const handleFollow = async () => {
    if (!currentUser) return navigate('login');
    try {
      if (article.author.following) {
        const res = await api.unfollowUser(article.author.username);
        setArticle(prev => ({ ...prev, author: res.profile }));
      } else {
        const res = await api.followUser(article.author.username);
        setArticle(prev => ({ ...prev, author: res.profile }));
      }
    } catch {}
  };

  const handleDeleteArticle = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.deleteArticle(slug);
        navigate('home');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.addComment(slug, commentBody);
      setComments([res.comment, ...comments]);
      setCommentBody('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await api.deleteComment(slug, id);
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '15vh' }}></div>;
  if (error || !article) return <div className="empty-state"><p>{error || 'Article not found.'}</p></div>;

  const isAuthor = currentUser && currentUser.username === article.author.username;

  return (
    <div>
      <section className="article-detail-banner">
        <div className="article-detail-header">
          <h1 className="article-detail-title">{article.title}</h1>

          <div className="article-actions">
            <div 
              className="author-meta" 
              onClick={() => navigate('profile', { username: article.author.username })}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={getAvatarUrl(article.author)} 
                alt={article.author.username} 
                className="author-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
              />
              <div className="author-info">
                <h4>{article.author.username}</h4>
                <time>{new Date(article.createdAt).toLocaleDateString()}</time>
              </div>
            </div>

            {isAuthor ? (
              <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate('editor', { slug: article.slug })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Edit3 size={15} /> Edit
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleDeleteArticle}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
                <button className="btn-secondary" onClick={handleFollow}>
                  {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </button>
                <button 
                  className={`fav-btn ${article.favorited ? 'favorited' : ''}`}
                  onClick={handleFavorite}
                >
                  <Heart size={16} fill={article.favorited ? "currentColor" : "none"} />
                  <span>{article.favorited ? 'Favorited' : 'Favorite'} ({article.favoritesCount})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="main-content">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: marked.parse(article.body || '') }}
        />

        <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '2rem' }}>
          <div className="tags-list">
            {article.tagList?.map(t => (
              <span key={t} className="tag-badge">#{t}</span>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <section className="comments-section">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="#10b981" />
            Discussion ({comments.length})
          </h3>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="form-card" style={{ padding: '1.25rem', marginBottom: '2rem', maxWidth: '100%' }}>
              <textarea 
                className="form-textarea" 
                placeholder="Write a comment..."
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                style={{ minHeight: '90px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button className="btn-primary" type="submit" disabled={submittingComment} style={{ width: 'auto', padding: '0.55rem 1.4rem' }}>
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
              <span onClick={() => navigate('login')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>Sign in</span> or <span onClick={() => navigate('register')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>sign up</span> to add comments on this article.
            </p>
          )}

          {comments.map(c => (
            <div key={c.id} className="comment-card">
              <div className="comment-body">{c.body}</div>
              <footer className="comment-footer">
                <div 
                  className="author-meta" 
                  onClick={() => navigate('profile', { username: c.author.username })}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={getAvatarUrl(c.author)} 
                    alt={c.author.username} 
                    className="author-img"
                    style={{ width: 28, height: 28 }}
                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{c.author.username}</span>
                  <time style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </time>
                </div>
                {currentUser && currentUser.username === c.author.username && (
                  <button 
                    onClick={() => handleDeleteComment(c.id)}
                    title="Delete Comment"
                    style={{ color: 'var(--danger)', opacity: 0.8 }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </footer>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// EDITOR VIEW (Create & Edit)
// -----------------------------------------------------------------------------
function EditorView({ slug, currentUser, navigate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    if (slug) {
      setLoading(true);
      api.getArticle(slug)
        .then(res => {
          const a = res.article;
          setTitle(a.title);
          setDescription(a.description);
          setBody(a.body);
          setTagList(a.tagList || []);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim();
      if (!tagList.includes(val)) {
        setTagList([...tagList, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setTagList(tagList.filter(x => x !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      body,
      tagList,
    };

    try {
      let res;
      if (slug) {
        res = await api.updateArticle(slug, payload);
      } else {
        res = await api.createArticle(payload);
      }
      navigate('article', { slug: res.article.slug });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-card" style={{ maxWidth: 820 }}>
        <header className="form-header">
          <h2>{slug ? 'Edit Article' : 'Write New Article'}</h2>
          <p>Share your ideas, tutorials, or updates with the community.</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Article Title</label>
            <input 
              className="form-input" 
              placeholder="e.g. Building high-performance APIs with FastAPI"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">What's this article about?</label>
            <input 
              className="form-input" 
              placeholder="Short description / summary"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Body (Markdown supported)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Write your article in markdown..."
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ minHeight: 240 }}
              required
            />
          </div>

          {!slug && (
            <div className="form-group">
              <label className="form-label">Tags (press Enter to add)</label>
              <input 
                className="form-input" 
                placeholder="python, fastapi, tutorial..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="tags-list" style={{ marginTop: '0.6rem' }}>
                {tagList.map(tag => (
                  <span key={tag} className="tag-badge" onClick={() => removeTag(tag)}>
                    #{tag} &times;
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Publishing...' : slug ? 'Update Article' : 'Publish Article'}
          </button>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// AUTH VIEW (Sign in / Sign up)
// -----------------------------------------------------------------------------
function AuthView({ isRegister, onAuthSuccess, navigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isRegister) {
        res = await api.register(username, email, password);
      } else {
        res = await api.login(email, password);
      }
      setToken(res.user.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-card">
        <header className="form-header">
          <h2>{isRegister ? 'Create an Account' : 'Welcome Back'}</h2>
          <p>
            {isRegister ? (
              <>Have an account? <span onClick={() => navigate('login')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>Sign in here</span></>
            ) : (
              <>Need an account? <span onClick={() => navigate('register')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>Sign up here</span></>
            )}
          </p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input" 
                placeholder="Your unique handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email"
              className="form-input" 
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password"
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SETTINGS VIEW
// -----------------------------------------------------------------------------
function SettingsView({ currentUser, onUpdate, onLogout }) {
  const [image, setImage] = useState(currentUser.image || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');

    const payload = { image, username, bio, email };
    if (password) payload.password = password;

    try {
      const res = await api.updateUser(payload);
      onUpdate(res.user);
      setMsg('Settings updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-card">
        <header className="form-header">
          <h2>Your Settings</h2>
          <p>Update your public profile, account information, and credentials.</p>
        </header>

        {msg && <div style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>{msg}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <input 
              className="form-input" 
              placeholder="https://..."
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <textarea 
              className="form-textarea" 
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ minHeight: 90 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email"
              className="form-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password (leave blank to keep current)</label>
            <input 
              type="password"
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Update Settings'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <button className="btn-danger" onClick={onLogout} style={{ width: '100%' }}>
            Log Out of Session
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PROFILE VIEW
// -----------------------------------------------------------------------------
function ProfileView({ username, currentUser, navigate }) {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [tab, setTab] = useState('author'); // 'author' | 'favorited'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile(username).then(res => setProfile(res.profile)).catch(() => {});
  }, [username]);

  const loadArticles = () => {
    setLoading(true);
    const query = tab === 'author' ? { author: username } : { favorited: username };
    api.getArticles(query)
      .then(res => setArticles(res.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, [username, tab]);

  const handleFollow = async () => {
    if (!currentUser) return navigate('login');
    try {
      if (profile.following) {
        const res = await api.unfollowUser(username);
        setProfile(res.profile);
      } else {
        const res = await api.followUser(username);
        setProfile(res.profile);
      }
    } catch {}
  };

  if (!profile) return <div className="spinner" style={{ marginTop: '15vh' }}></div>;

  const isSelf = currentUser && currentUser.username === username;

  return (
    <div>
      <section className="profile-banner">
        <img 
          src={getAvatarUrl(profile)} 
          alt={profile.username} 
          className="profile-avatar-large"
          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
        />
        <h2 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>{profile.username}</h2>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div style={{ marginTop: '1rem' }}>
          {isSelf ? (
            <button className="btn-secondary" onClick={() => navigate('settings')}>
              <SettingsIcon size={15} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
              Edit Profile Settings
            </button>
          ) : (
            <button className="btn-secondary" onClick={handleFollow}>
              <UserIcon size={15} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
              {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
            </button>
          )}
        </div>
      </section>

      <div className="main-content" style={{ maxWidth: 880 }}>
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${tab === 'author' ? 'active' : ''}`}
            onClick={() => setTab('author')}
          >
            My Articles
          </button>
          <button 
            className={`tab-btn ${tab === 'favorited' ? 'active' : ''}`}
            onClick={() => setTab('favorited')}
          >
            Favorited Articles
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>No articles found for this user.</p>
          </div>
        ) : (
          articles.map(article => (
            <article key={article.slug} className="article-card">
              <header className="article-header">
                <div className="author-meta">
                  <img 
                    src={getAvatarUrl(article.author)} 
                    alt={article.author.username} 
                    className="author-img"
                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  />
                  <div className="author-info">
                    <h4>{article.author.username}</h4>
                    <time>{new Date(article.createdAt).toLocaleDateString()}</time>
                  </div>
                </div>

                <div className="fav-btn" style={{ pointerEvents: 'none' }}>
                  <Heart size={15} fill={article.favorited ? "currentColor" : "none"} />
                  <span>{article.favoritesCount}</span>
                </div>
              </header>

              <div 
                className="article-body-preview"
                onClick={() => navigate('article', { slug: article.slug })}
              >
                <h2 className="article-title">{article.title}</h2>
                <p className="article-desc">{article.description}</p>
              </div>

              <footer className="article-footer">
                <button 
                  className="read-more"
                  onClick={() => navigate('article', { slug: article.slug })}
                >
                  Read more <ChevronRight size={14} />
                </button>
                <div className="tags-list">
                  {article.tagList?.map(tag => (
                    <span key={tag} className="tag-badge">#{tag}</span>
                  ))}
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
