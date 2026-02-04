import { Routes, Route, Navigate } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { PersonList } from './pages/PersonList';
import { CreatePerson } from './pages/CreatePerson';
import { Wishlist } from './pages/Wishlist';
import { SharedView } from './pages/SharedView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/persons" element={<PersonList />} />
      <Route path="/create" element={<CreatePerson />} />
      <Route path="/list/:personId" element={<Wishlist />} />
      <Route path="/share/:shareCode" element={<SharedView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
