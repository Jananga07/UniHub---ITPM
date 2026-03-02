import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import "./ModuleDetailsPage.css";

function ModuleDetailsPage() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/modules/${id}`);
        setModule(res.data.module);
      } catch (err) {
        console.error(err);
      }
    };

    fetchModule();
  }, [id]);

  if (!module) return <p>Loading...</p>;

  return (
    <div className="module-details-container">
      <h1>{module.moduleName}</h1>
      <p className="module-code">{module.moduleCode}</p>

      {/* PDFs Section */}
      <div className="section">
        <h2>PDF Resources</h2>
        {module.pdfs?.length > 0 ? (
          module.pdfs.map((pdf, index) => (
            <a key={index} href={pdf.url} target="_blank" rel="noreferrer">
              📄 {pdf.title}
            </a>
          ))
        ) : (
          <p>No PDFs uploaded.</p>
        )}
      </div>

      {/* Quizzes Section */}
      <div className="section">
        <h2>Quizzes</h2>
        {module.quizzes && module.quizzes.length > 0 ? (
          module.quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>

              {/* ✅ FIXED BUTTON */}
              <button onClick={() => navigate(`/student-quiz/${id}`)}>
                Start Quiz
              </button>
            </div>
          ))
        ) : (
          <p>No quizzes available.</p>
        )}
      </div>
    </div>
  );
}

export default ModuleDetailsPage;