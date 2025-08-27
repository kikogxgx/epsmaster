import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardAujourdHui from './pages/DashboardAujourdHui';
import ClassesPage from './pages/ClassesPage';
import StudentsPage from './pages/StudentsPage';
import CyclesPage from './pages/CyclesPage';
import CycleDetailPage from './pages/CycleDetailPage';
import AbsencesProfesseurPage from './pages/AbsencesProfesseurPage';
import AppelSeance from './pages/AppelSeance';
import CahierSeance from './pages/CahierSeance';
import EvaluationSeance from './pages/EvaluationSeance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
      {/* Redirige l'index vers DashboardAujourdHui pour lister les séances du jour */}
      <Route index element={<DashboardAujourdHui />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/:id" element={<StudentsPage />} />
        <Route path="cycles" element={<CyclesPage />} />
        <Route path="cycles/:id" element={<CycleDetailPage />} />
        <Route path="absences-prof" element={<AbsencesProfesseurPage />} />

      {/* Routes des modules pédagogiques */}
      <Route path="classe/:classeId/seance/:seanceId/appel" element={<AppelSeance />} />
      <Route path="classe/:classeId/seance/:seanceId/cahier" element={<CahierSeance />} />
      <Route path="classe/:classeId/seance/:seanceId/evaluation" element={<EvaluationSeance />} />
      </Route>
    </Routes>
  );
}

export default App;
