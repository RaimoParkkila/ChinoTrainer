import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

// Lataa JSON-tiedosto (käytä oikeaa polkua)
const questionsData = require('./assets/data/questions.json');

type Question = {
  id: string;
  kysymys: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
};

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerFeedback, setAnswerFeedback] = useState<string>('');

  // Lataa kysymykset JSON-tiedostosta
  useEffect(() => {
    const kysymykset = questionsData.find(
      (item: any) => item.type === 'table' && item.name === 'kysymykset'
    );
    if (kysymykset && kysymykset.data) {
      setQuestions(kysymykset.data); // Aseta kysymykset
    }
  }, []);

  const handleAnswer = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
  
    // Varmistetaan, että kysymys on ladattu oikein
    if (!currentQuestion) {
      return; // Jos ei ole kysymystä, ei tehdä mitään
    }
  
    // Etsitään käyttäjän valitseman vastauksen avain
    const selectedKey = Object.keys(currentQuestion).find(
      key => currentQuestion[key] === selectedOption
    );
  
    // Oikean vastauksen avain ja arvo
    const correctKey = currentQuestion.answer; // Esim. "A", "B", jne.
    const correctValue = currentQuestion[correctKey]; // Esim. "Oikea vastaus"
  
    if (selectedKey === correctKey) {
      setScore(prevScore => prevScore + 1); // Pisteen lisääminen
      setAnswerFeedback('Correct!'); // Näytetään palautteena "Oikein"
    } else {
      setAnswerFeedback(
        `Wrong answer! The correct answer is: ${correctKey} - ${correctValue}`
        
      ); // Näytetään virheviesti ja oikea vastaus
    }
  
    // Siirrytään seuraavaan kysymykseen, jos niitä on jäljellä
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setAnswerFeedback(''); // Tyhjennetään palaute
        setCurrentQuestionIndex(prevIndex => prevIndex + 1); // Siirrytään seuraavaan kysymykseen
      }, 1000); // Asetetaan pieni viive ennen seuraavaan siirtymistä
    } else {
      // Kaikki kysymykset on käyty läpi
      setTimeout(() => {
        Alert.alert(`Quiz Finished! Your score is: ${score + 1}`);
        setScore(0); // Nollaa pisteet
        setCurrentQuestionIndex(0); // Alusta kysymykset uudestaan
      }, 1000);
    }
  };
  
  

  const renderItem = ({ item }: { item: Question }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{item.kysymys}</Text>
      <TouchableOpacity onPress={() => handleAnswer(item.A)} style={styles.optionButton}>
        <Text style={styles.optionText}>{item.A}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAnswer(item.B)} style={styles.optionButton}>
        <Text style={styles.optionText}>{item.B}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAnswer(item.C)} style={styles.optionButton}>
        <Text style={styles.optionText}>{item.C}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAnswer(item.D)} style={styles.optionButton}>
        <Text style={styles.optionText}>{item.D}</Text>
      </TouchableOpacity>
      <Text style={styles.feedback}>{answerFeedback}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      {questions.length > 0 && (
        <FlatList
          data={questions.slice(currentQuestionIndex, currentQuestionIndex + 1)} // Renderöidään vain yksi kysymys kerrallaan
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  questionContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: 200,
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  score: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  feedback: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
  },
});

export default App;
