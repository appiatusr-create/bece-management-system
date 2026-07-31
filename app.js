const $ = (id) => document.getElementById(id);
const subjectIds = ['english','mathematics','science','social','computing','career_tech','creative_arts','rme','ghanaian_language'];
const labels = {
  english:'English Language', mathematics:'Mathematics', science:'Integrated Science', social:'Social Studies',
  computing:'Computing', career_tech:'Career Technology', creative_arts:'Creative Arts & Design', rme:'R.M.E.',
  ghanaian_language:'Ghanaian Language/French'
};

function readGrade(id) {
  const value = Number($(id).value);
  if (!Number.isInteger(value) || value < 1 || value > 9) {
    throw new Error(`Please enter a grade from 1 to 9 for ${labels[id]}.`);
  }
  return value;
}

function analyse(grades) {
  const coreIds = ['english','mathematics','science','social'];
  const additionalIds = ['computing','career_tech','creative_arts','rme','ghanaian_language'];
  const coreTotal = coreIds.reduce((sum,id) => sum + grades[id], 0);
  const rankedAdditional = additionalIds
    .map(id => ({id, name:labels[id], grade:grades[id]}))
    .sort((a,b) => a.grade - b.grade || a.name.localeCompare(b.name));
  const bestTwo = rankedAdditional.slice(0,2);
  const aggregate = coreTotal + bestTwo[0].grade + bestTwo[1].grade;

  let programme = 'General Arts';
  let reason = 'your balanced performance across the selected subjects';
  if (grades.science <= 3 && grades.mathematics <= 3) {
    programme = 'General Science'; reason = 'your strong Mathematics and Integrated Science grades';
  } else if (grades.computing <= 3 && grades.mathematics <= 4) {
    programme = 'Technical / ICT'; reason = 'your strong Computing and Mathematics grades';
  } else if (grades.career_tech <= 3) {
    programme = 'Technical'; reason = 'your strong Career Technology grade';
  } else if (grades.creative_arts <= 3) {
    programme = 'Visual Arts'; reason = 'your strong Creative Arts & Design grade';
  } else if (grades.english <= 3 && grades.social <= 4) {
    programme = 'General Arts'; reason = 'your strong English Language and Social Studies grades';
  } else if (grades.mathematics <= 4) {
    programme = 'Business'; reason = 'your good Mathematics foundation';
  }

  const standing = aggregate <= 12 ? 'Excellent' : aggregate <= 18 ? 'Very Good' : aggregate <= 24 ? 'Good' : aggregate <= 30 ? 'Fair' : 'Needs Improvement';
  return {coreIds, coreTotal, bestTwo, aggregate, programme, reason, standing};
}

function showMessage(text, type='error') {
  const el = $('formMessage');
  el.className = `notice ${type}`;
  el.textContent = text;
  el.classList.remove('hidden');
}

function renderResult(grades, result) {
  const coreRows = result.coreIds.map(id => `<tr><td>${labels[id]}</td><td>Grade ${grades[id]}</td><td><span class="pill">Core</span></td></tr>`).join('');
  const electiveRows = result.bestTwo.map(item => `<tr><td>${item.name}</td><td>Grade ${item.grade}</td><td><span class="pill">Best additional</span></td></tr>`).join('');
  const card = $('resultCard');
  card.innerHTML = `
    <div class="result-header"><div><span class="step">Your Result</span><h2>BECE Aggregate: ${result.aggregate}</h2><p class="muted">Overall assessment: <b>${result.standing}</b></p></div><div class="score-circle">${result.aggregate}</div></div>
    <div class="result-grid">
      <div>
        <h3>Subjects Counted</h3>
        <div class="table-wrap compact"><table><thead><tr><th>Subject</th><th>Grade</th><th>Category</th></tr></thead><tbody>${coreRows}${electiveRows}</tbody></table></div>
        <p class="calculation"><b>Calculation:</b> Core total ${result.coreTotal} + best two additional grades ${result.bestTwo[0].grade} + ${result.bestTwo[1].grade} = <b>${result.aggregate}</b></p>
      </div>
      <div class="recommendation-box">
        <span class="badge">Suggested pathway</span>
        <h3>${result.programme}</h3>
        <p>This suggestion is based on ${result.reason}.</p>
        <p class="muted">Also consider your interests, career goals, school requirements and official placement guidance.</p>
      </div>
    </div>
    <div class="actions"><button class="btn" type="button" onclick="window.print()">Print Result</button><button class="btn secondary" type="button" id="checkAgain">Check Another Result</button></div>`;
  card.classList.remove('hidden');
  $('checkAgain').addEventListener('click', () => {
    $('gradeForm').reset();
    card.classList.add('hidden');
    $('formMessage').classList.add('hidden');
    $('checker').scrollIntoView({behavior:'smooth'});
    $('english').focus();
  });
  card.scrollIntoView({behavior:'smooth', block:'start'});
}

$('gradeForm').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const grades = Object.fromEntries(subjectIds.map(id => [id, readGrade(id)]));
    const result = analyse(grades);
    $('formMessage').classList.add('hidden');
    renderResult(grades, result);
  } catch (error) {
    showMessage(error.message);
  }
});

$('gradeForm').addEventListener('reset', () => {
  $('resultCard').classList.add('hidden');
  $('formMessage').classList.add('hidden');
});
