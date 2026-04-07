# Quick Reference Guide - New UX Components & Features

## 🎯 Toast Notifications

### Basic Usage
```typescript
import { useToast } from '@/context/ToastContext';

function MyComponent() {
    const { addToast } = useToast();
    
    const handleSuccess = () => {
        addToast({
            type: 'success',
            title: 'Success!',
            message: 'Operation completed successfully',
            duration: 3000
        });
    };

    return <button onClick={handleSuccess}>Click me</button>;
}
```

### Available Types
- `'success'` - Green notification for successful actions
- `'error'` - Red notification for errors
- `'info'` - Blue notification for information
- `'warning'` - Yellow notification for warnings

### Properties
- `type` (required) - Type of notification
- `title` (required) - Main heading
- `message` (optional) - Detailed message
- `duration` (optional) - Auto-dismiss time in ms (default: 3000)

---

## 🔄 Loading States & Skeletons

### Skeleton Loaders
```typescript
import { SkeletonLoader, SkeletonStats, EmptyState } from '@/components/LoadingStates';

// Generic card skeleton
{loading && <SkeletonLoader count={5} lines={3} />}

// Dashboard stats skeleton
{loading && <SkeletonStats />}

// Empty state
{!loading && items.length === 0 && (
    <EmptyState
        icon="◎"
        title="No Projects"
        description="Start by adding your first project"
        action={<button className="btn btn-primary">Add Project</button>}
    />
)}
```

### Properties
- `count` - Number of skeleton cards to show
- `lines` - Number of placeholder lines per card
- `icon` - Emoji/icon for empty state
- `title` - Empty state title
- `description` - Empty state message
- `action` - JSX button or link

---

## ✅ Form Validation Hook

### Setup
```typescript
import { useFormValidation } from '@/hooks/useFormValidation';

const form = useFormValidation(
    {
        email: { value: '', error: '' },
        password: { value: '', error: '' }
    },
    {
        email: {
            validate: (value) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+$/.test(value)) return 'Invalid email';
                return null;
            }
        },
        password: {
            validate: (value) => {
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Min 6 characters';
                return null;
            }
        }
    }
);
```

### Usage in React
```typescript
const state = form.getFieldState('email');
const props = form.getFieldProps('email');

<input
    {...props}
    className={`form-input ${state.error ? 'error' : ''}`}
    type="email"
/>
{state.error && (
    <div className="form-error">
        <span>⚠</span> {state.error}
    </div>
)}
```

### Available Methods
- `getFieldProps(name)` - Returns props for input element
- `getFieldState(name)` - Returns current field state
- `setFieldValue(name, value)` - Update field value
- `setFieldTouched(name)` - Mark field as touched
- `isFormValid()` - Check if entire form is valid
- `resetForm()` - Reset all fields
- `values` - Get all values as object

---

## 🎨 Form Input States

### CSS Classes

```html
<!-- Error state -->
<input class="form-input error" type="text" />

<!-- Success state -->
<input class="form-input success" type="text" />

<!-- Helper text -->
<p class="form-helper">This is a helper text</p>

<!-- Error message -->
<div class="form-error">⚠ This field is required</div>

<!-- Success message -->
<div class="form-success">✓ Looking good!</div>
```

---

## 🌐 Responsive Breakpoints

### CSS Grid Responsive Behavior
```css
/* Desktop */
@media (min-width: 901px) {
  .grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .grid-2 { grid-template-columns: 1fr 1fr; }
}

/* Tablet */
@media (max-width: 900px) {
  .grid-4 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 768px) {
  .grid-4 { grid-template-columns: 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}
```

---

## 🎬 Animations & Effects

### Built-in Classes
```html
<!-- Fade in animation -->
<div class="fade-in">Content here</div>

<!-- Scale up animation -->
<div class="scale-in">Content here</div>

<!-- Slide down animation -->
<div class="slide-down">Content here</div>

<!-- Pulse effect -->
<div class="pulse">Content here</div>
```

---

## 📊 Progress Indicators

```html
<div class="progress">
    <div class="progress-bar" style="width: 65%;"></div>
</div>
```

---

## 📋 Common Patterns

### Login Form with Validation
```typescript
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/context/ToastContext';

export function LoginForm() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const form = useFormValidation(
        { email: { value: '' }, password: { value: '' } },
        {
            email: {
                validate: (val) => {
                    if (!val) return 'Required';
                    if (!/^[^\s@]+@[^\s@]+$/.test(val)) return 'Invalid email';
                    return null;
                }
            },
            password: {
                validate: (val) => {
                    if (!val) return 'Required';
                    if (val.length < 6) return 'Min 6 chars';
                    return null;
                }
            }
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.isFormValid()) {
            addToast({ type: 'error', title: 'Form Error', message: 'Please fix errors' });
            return;
        }
        
        setLoading(true);
        try {
            // API call
            addToast({ type: 'success', title: 'Logged in!', message: 'Welcome back' });
        } catch (err) {
            addToast({ type: 'error', title: 'Login failed', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const emailState = form.getFieldState('email');
    const passwordState = form.getFieldState('password');

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                    {...form.getFieldProps('email')}
                    className={`form-input ${emailState.error ? 'error' : ''}`}
                    type="email"
                />
                {emailState.error && <div className="form-error">{emailState.error}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                    {...form.getFieldProps('password')}
                    className={`form-input ${passwordState.error ? 'error' : ''}`}
                    type="password"
                />
                {passwordState.error && <div className="form-error">{passwordState.error}</div>}
            </div>

            <button className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? <>
                    <span className="spinner" /> Processing...
                </> : 'Sign In →'}
            </button>
        </form>
    );
}
```

### Data Loading with Skeleton
```typescript
export function ProjectsList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/api/projects');
            setProjects(res.data);
        } catch (err) {
            addToast({ type: 'error', title: 'Failed', message: 'Could not load projects' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? (
                <SkeletonLoader count={5} />
            ) : projects.length === 0 ? (
                <EmptyState 
                    title="No Projects"
                    description="Add your first project to get started"
                    action={<button className="btn btn-primary">Add Project</button>}
                />
            ) : (
                <div className="grid-2">
                    {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
            )}
        </div>
    );
}
```

---

## 🧪 Testing Your Implementations

### Test Checklist
- ✅ Form validation errors appear on blur
- ✅ Toast notifications auto-dismiss
- ✅ Loading skeletons appear while loading
- ✅ Empty states show when no data
- ✅ Responsive: Test on mobile, tablet, desktop
- ✅ Keyboard navigation works
- ✅ Focus indicators visible on all buttons
- ✅ Colors have sufficient contrast

---

## 🚀 Best Practices

1. **Always validate forms** before submission
2. **Provide feedback** for every user action
3. **Show skeletons** while loading data
4. **Guide users** with empty states
5. **Make buttons accessible** - min 44px height
6. **Use toasts wisely** - don't overload with notifications
7. **Test on mobile** - 50%+ traffic is mobile
8. **Respect accessibility** - ARIA labels, keyboard nav

---

## 📚 More Resources

See `UX_IMPROVEMENTS.md` for:
- Complete implementation details
- Browser support information
- Accessibility checklist
- File structure and locations
- Integration guide
- Performance details
