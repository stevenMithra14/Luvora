import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { CreateGiftStep1 } from './pages/CreateGiftStep1';
import { CreateGiftStep2 } from './pages/CreateGiftStep2';
import { CreateGiftStep3 } from './pages/CreateGiftStep3';
import { CreateGiftStep4 } from './pages/CreateGiftStep4';
import { CreateGiftGoodies } from './pages/CreateGiftGoodies';
import { CreateGiftInteractive } from './pages/CreateGiftInteractive';
import { CreateGiftPreview } from './pages/CreateGiftPreview';
import { PublicGiftPage } from './pages/PublicGiftPage';
import { EditGiftPage } from './pages/EditGiftPage';
import { WizardProvider } from './context/WizardContext';

export default function App() {
  return (
    <WizardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="create" element={<CreateGiftStep1 />} />
            <Route path="create/person" element={<CreateGiftStep2 />} />
            <Route path="create/step-2" element={<CreateGiftStep2 />} />
            <Route path="create/customize" element={<CreateGiftStep3 />} />
            <Route path="create/step-3" element={<CreateGiftStep3 />} />
            <Route path="create/memories" element={<CreateGiftStep4 />} />
            <Route path="create/step-4" element={<CreateGiftStep4 />} />
            <Route path="create/goodies" element={<CreateGiftGoodies />} />
            <Route path="create/step-5" element={<CreateGiftGoodies />} />
            <Route path="create/interactive" element={<CreateGiftInteractive />} />
            <Route path="create/step-6" element={<CreateGiftInteractive />} />
            <Route path="create/preview" element={<CreateGiftPreview />} />
            <Route path="create/step-7" element={<CreateGiftPreview />} />
          </Route>

          {/* Standalone Recipient & Edit Routes */}
          <Route path="/g/:public_id" element={<PublicGiftPage />} />
          <Route path="/edit/:edit_token" element={<EditGiftPage />} />
        </Routes>
      </Router>
    </WizardProvider>
  );
}

