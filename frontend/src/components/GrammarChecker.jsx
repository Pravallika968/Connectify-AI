import React, { useState } from 'react';
import '../styles/GrammarChecker.css';

const GrammarChecker = ({ message, onCorrect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSuggestion, setEditedSuggestion] = useState('');

  // Common spelling errors dictionary
  const spellingErrors = {
    'yesturday': 'yesterday',
    'teh': 'the',
    'recieve': 'receive',
    'wich': 'which',
    'occured': 'occurred',
    'becuase': 'because',
    'untill': 'until',
    'occassion': 'occasion',
    'realy': 'really',
    'finaly': 'finally',
    'seperate': 'separate',
    'occassionally': 'occasionally',
    'goverment': 'government',
    'consern': 'concern',
    'develope': 'develop',
    'recieved': 'received',
    'neccessary': 'necessary',
    'geting': 'getting',
    'writting': 'writing',
    'studing': 'studying'
  };

  // Common verb conjugation and tense errors
  const verbErrors = {
    // Present tense errors
    'he go': 'he goes',
    'she go': 'she goes',
    'he come': 'he comes',
    'she come': 'she comes',
    'he do': 'he does',
    'she do': 'she does',
    'he have': 'he has',
    'she have': 'she has',
    'it are': 'it is',
    'they is': 'they are',
    'he eat': 'he eats',
    'she eat': 'she eats',
    'he say': 'he says',
    'she say': 'she says',
    'he take': 'he takes',
    'she take': 'she takes',
    'he give': 'he gives',
    'she give': 'she gives',
    'he see': 'he sees',
    'she see': 'she sees',
    'he run': 'he runs',
    'she run': 'she runs',
    'he jump': 'he jumps',
    'she jump': 'she jumps',
    
    // Past tense errors
    'i was go': 'i went',
    'he was go': 'he went',
    'she was go': 'she went',
    'they was': 'they were',
    'i was came': 'i came',
    'he was came': 'he came',
    'she was came': 'she came',
    'i am going': 'i am going',
    'he go yesterday': 'he went yesterday',
    'she go yesterday': 'she went yesterday',
    'i finish': 'i finished',
    'he finish': 'he finished',
    'she finish': 'she finished',
    'they finish': 'they finished',
    
    // Future tense errors
    'i will goes': 'i will go',
    'he will goes': 'he will go',
    'she will comes': 'she will come',
    'they will is': 'they will be',
    
    // Continuous tense errors
    'he is go': 'he is going',
    'she is come': 'she is coming',
    'he are going': 'he is going',
    'they am going': 'they are going',
    'i is going': 'i am going',
    
    // Perfect tense errors
    'i have go': 'i have gone',
    'he have go': 'he has gone',
    'she have come': 'she has come',
    'they have is': 'they have been',
    'i has been': 'i have been',
    'he have been': 'he has been'
  };

  // Simple grammar checking rules
  const checkGrammar = (text) => {
    const issues = [];
    

    // Improved tense detection: past tense context with present verb
    const pastIndicators = ['yesterday', 'last', 'ago'];
    pastIndicators.forEach(indicator => {
      // e.g. 'he go to school yesterday', 'she come last week', 'they finish 2 days ago'
      const regex = new RegExp(`\\b(he|she|they|I|we|you)\\s+(go|come|eat|finish|start|stop|help|ask|show|talk|walk|run|play)\\b[^.?!]*\\b${indicator}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const subject = match[1];
        const verb = match[2];
        // Simple past tense conversion
        const verbPast = {
          'go': 'went',
          'come': 'came',
          'eat': 'ate',
          'finish': 'finished',
          'start': 'started',
          'stop': 'stopped',
          'help': 'helped',
          'ask': 'asked',
          'show': 'showed',
          'talk': 'talked',
          'walk': 'walked',
          'run': 'ran',
          'play': 'played'
        };
        if (verbPast[verb]) {
          const suggestion = match[0].replace(new RegExp(`\\b${verb}\\b`), verbPast[verb]);
          issues.push({
            error: match[0],
            suggestion,
            message: 'Use past tense verb with past time indicator',
            position: match.index,
            length: match[0].length
          });
        }
      }
    });

    // Check for verb conjugation errors (exact matches)
    Object.keys(verbErrors).forEach(error => {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          error: match[0],
          suggestion: verbErrors[error.toLowerCase()],
          message: 'Incorrect verb conjugation',
          position: match.index,
          length: match[0].length
        });
      }
    });

    // Check for spelling errors
    Object.keys(spellingErrors).forEach(error => {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          error: match[0],
          suggestion: spellingErrors[error.toLowerCase()],
          message: 'Spelling error',
          position: match.index,
          length: match[0].length
        });
      }
    
            // Subject-verb agreement errors (e.g., 'they am', 'we am', 'you am')
            const subjectVerbAgreement = [
              { pattern: /\b(they|we|you)\s+am\b/gi, correct: (subj) => `${subj} are` },
              { pattern: /\b(I)\s+are\b/gi, correct: (subj) => `${subj} am` },
              { pattern: /\b(he|she|it)\s+are\b/gi, correct: (subj) => `${subj} is` },
              { pattern: /\b(he|she|it)\s+am\b/gi, correct: (subj) => `${subj} is` }
            ];
            subjectVerbAgreement.forEach(rule => {
              let match;
              const regex = new RegExp(rule.pattern);
              while ((match = regex.exec(text)) !== null) {
                const subj = match[1];
                const suggestion = rule.correct(subj);
                issues.push({
                  error: match[0],
                  suggestion,
                  message: 'Subject-verb agreement error',
                  position: match.index,
                  length: match[0].length
                });
              }
            });
    });

    // Check for common grammar issues
    const rules = [
      {
        pattern: /\b(a|an)\s+([aeiou])/gi,
        check: (match, article, nextChar) => {
          if (article.toLowerCase() === 'a' && 'aeiou'.includes(nextChar.toLowerCase())) {
            return { error: match, suggestion: 'an ' + nextChar, message: 'Use "an" before vowels' };
          }
          return null;
        }
      },
      {
        pattern: /\bi\b/g,
        check: (match) => {
          if (match === 'i') {
            return { error: 'i', suggestion: 'I', message: 'Capitalize "I"' };
          }
          return null;
        }
      },
      {
        pattern: /\b(their|there|they're)\b/gi,
        check: (match) => {
          // This would need more context to properly check
          return null;
        }
      },
      {
        pattern: /([.!?])\s+([a-z])/g,
        check: (match, punct, letter) => {
          return { error: match, suggestion: punct + ' ' + letter.toUpperCase(), message: 'Capitalize after punctuation' };
        }
      },
      {
        pattern: /\s{2,}/g,
        check: (match) => {
          return { error: match, suggestion: ' ', message: 'Remove extra spaces' };
        }
      },
      {
        pattern: /\b(dont|wont|cant|isnt|arent|wasnt|werent)\b/gi,
        check: (match) => {
          const corrections = {
            'dont': "don't",
            'wont': "won't",
            'cant': "can't",
            'isnt': "isn't",
            'arent': "aren't",
            'wasnt': "wasn't",
            'werent': "weren't"
          };
          const lower = match.toLowerCase();
          if (corrections[lower]) {
            return { error: match, suggestion: corrections[lower], message: `Use apostrophe: "${corrections[lower]}"` };
          }
          return null;
        }
      }
    ];

    let lastIndex = 0;
    rules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern);
      while ((match = regex.exec(text)) !== null) {
        const issue = rule.check(match[0], ...match.slice(1));
        if (issue) {
          issues.push({
            ...issue,
            position: match.index,
            length: match[0].length
          });
        }
      }
    });

    // Additional tense-specific pattern matching
    const tensingRules = [
      {
        // Past tense missing -ed
        pattern: /\b(yesterday|last\s+\w+|ago)\s+.*?\b(go|come|eat|finish|start|stop|help|ask|show|talk|walk|run|play)\b/gi,
        check: (match) => {
          return null; // Complex context needed, skip for now
        }
      },
      {
        // Double auxiliary verbs
        pattern: /\b(is|are|am)\s+(be|being|been)\b/gi,
        check: (match, aux1, aux2) => {
          if (aux1.toLowerCase() === 'is' && aux2.toLowerCase() === 'be') {
            return { error: match, suggestion: 'is being', message: 'Redundant auxiliary verbs' };
          }
          return null;
        }
      },
      {
        // Wrong auxiliary with past participle
        pattern: /\b(is|are|am)\s+(went|came|ate|finished|started|stopped|helped)\b/gi,
        check: (match) => {
          return { error: match, suggestion: match.replace('is', 'was').replace('are', 'were').replace('am', 'was'), message: 'Wrong auxiliary for past tense' };
        }
      }
    ];

    tensingRules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern);
      while ((match = regex.exec(text)) !== null) {
        const issue = rule.check(match[0], ...match.slice(1));
        if (issue) {
          issues.push({
            ...issue,
            position: match.index,
            length: match[0].length
          });
        }
      }
    });

    return issues;
  };

  const handleCheck = () => {
    if (message.trim().length === 0) return;
    
    const issues = checkGrammar(message);
    setSuggestions(issues);
    setShowSuggestions(issues.length > 0);
  };

  const applySuggestion = (index) => {
    const issue = suggestions[index];
    const corrected = message.substring(0, issue.position) +
                     issue.suggestion +
                     message.substring(issue.position + issue.length);
    onCorrect(corrected);

    // Update suggestions for corrected text
    const newIssues = checkGrammar(corrected);
    setSuggestions(newIssues);
  };

  const editSuggestion = (index) => {
    setEditingIndex(index);
    setEditedSuggestion(suggestions[index].suggestion);
  };

  const saveEditedSuggestion = (index) => {
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index].suggestion = editedSuggestion;
    setSuggestions(updatedSuggestions);
    setEditingIndex(null);
    setEditedSuggestion('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditedSuggestion('');
  };

  const deleteSuggestion = (index) => {
    const updatedSuggestions = suggestions.filter((_, i) => i !== index);
    setSuggestions(updatedSuggestions);
  };

  return (
    <div className="grammar-checker-container">
      <button 
        className="grammar-check-btn"
        onClick={handleCheck}
        title="Check grammar"
      >
        ✓ Grammar
      </button>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="grammar-suggestions">
          <div className="suggestions-header">
            <h4>Grammar Suggestions ({suggestions.length})</h4>
            <button 
              className="close-btn"
              onClick={() => setShowSuggestions(false)}
            >
              ✕
            </button>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-content">
                  <p className="suggestion-message">{suggestion.message}</p>
                  <p className="suggestion-change">
                    <span className="error">"{suggestion.error}"</span>
                    {' → '}
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedSuggestion}
                        onChange={(e) => setEditedSuggestion(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span className="correction">"{suggestion.suggestion}"</span>
                    )}
                  </p>
                </div>
                <div className="suggestion-actions">
                  {editingIndex === index ? (
                    <>
                      <button
                        className="save-btn"
                        onClick={() => saveEditedSuggestion(index)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="apply-btn"
                        onClick={() => applySuggestion(index)}
                      >
                        Apply
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => editSuggestion(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteSuggestion(index)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && message.trim().length > 0 && (
        <div className="grammar-suggestions success">
          <p>✓ No grammar issues found!</p>
        </div>
      )}
    </div>
  );
};

export default GrammarChecker;
