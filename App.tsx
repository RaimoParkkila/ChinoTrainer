import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing!');
  throw new Error('Supabase URL or Anon Key is missing!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Question {
  id: number;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: 'A' | 'B' | 'C' | 'D';
}

export default function App() {
  const [data, setData] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState<string>('');

  const speak = (text: string, lang: string) => {
    Speech.speak(text, { language: lang });
  };
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('chinese')
        .select('*');
  
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setData(data);
  
        // Varmistetaan, että data on ladattu ja siinä on kysymyksiä
        if (data && data.length > 0) {
          const firstQuestion = data[0];
  
          // Soitetaan ensimmäinen kysymys ja sitten tervehdys
          speak(firstQuestion.question, 'zh-CN'); // Puheeksi ensimmäinen kysymys kiinaksi
          speak("¡Hola señor, bienvenido a esta aplicación dos!", "es-ES"); // Espanja
        }
      }
    };
  
    fetchData();
  }, []); // Varmistaa, että tämä suoritetaan vain kerran, kun komponentti ladataan
  
  useEffect(() => {
    // Toistetaan aina, kun uusi kysymys valitaan
    if (data && data.length > 0) {
      const currentQuestion = data[currentQuestionIndex];
      speak(currentQuestion.question, 'zh-CN'); // Kysymys kiinaksi
    }
  }, [currentQuestionIndex, data]); // Suoritetaan aina, kun kysymys vaihdetaan
  
  const handleAnswer = (selectedKey: 'A' | 'B' | 'C' | 'D') => {
    const currentQuestion = data ? data[currentQuestionIndex] : null;
  
    if (!currentQuestion) {
      return; // Jos ei ole kysymystä, ei tehdä mitään
    }
  
    // Hae oikea vastaus
    const correctAnswerText = currentQuestion.answer; // Esim. "早上好 (Zǎoshang hǎo)"
  
    // Hae valittu vastaus
    const selectedAnswerText = currentQuestion[selectedKey.toLowerCase() as keyof Question];
  
    console.log(`Selected answer: ${selectedAnswerText}, Correct answer: ${correctAnswerText}`);
  
    // Oikea vastaus
    if (selectedAnswerText === correctAnswerText) {
      setScore(prevScore => prevScore + 1); // Pisteen lisääminen
      setAnswerFeedback('Correct!'); // Näytetään palautteena "Oikein"
      // Toistetaan espanjaksi "Oikein" ja sitten oikea kiinalainen vastaus
      speak("Correct! La respuesta correcta es:", "es-ES");
      speak(correctAnswerText, "zh-CN"); // Oikea vastaus kiinaksi
    } else {
      setAnswerFeedback(
        `Wrong answer! The correct answer is: ${correctAnswerText}` // Näytetään virheviesti ja oikea vastaus
      );
      // Toistetaan espanjaksi: "Oikea vastaus olisi ollut..."
      speak("La respuesta correcta habría sido:", "es-ES");
      // Toistetaan oikea vastaus kiinaksi
      speak(correctAnswerText, "zh-CN"); // Oikea vastaus kiinaksi
    }
  
    // Siirrytään seuraavaan kysymykseen
    if (currentQuestionIndex < (data ? data.length - 1 : 0)) {
      setTimeout(() => {
        setAnswerFeedback('');
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        Alert.alert(`Quiz Finished! Your score is: ${score + 1}`);
        setScore(0);
        setCurrentQuestionIndex(0);
      }, 1000);
    }
  };
  
  
  

  const renderItem = ({ item }: { item: Question }) => (
    <View style={styles.item}>
      <Text style={styles.question}>{item.question}A</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={() => handleAnswer('A')} style={styles.optionButton}>
          <Text style={styles.optionText}>A: {item.a || 'No option'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAnswer('B')} style={styles.optionButton}>
          <Text style={styles.optionText}>B: {item.b || 'No option'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAnswer('C')} style={styles.optionButton}>
          <Text style={styles.optionText}>C: {item.c || 'No option'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAnswer('D')} style={styles.optionButton}>
          <Text style={styles.optionText}>D: {item.d || 'No option'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.feedback}>{answerFeedback}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the QuizApp!</Text>
      <Text>Score: {score}</Text>
      {data ? (
        <FlatList
          data={data ? [data[currentQuestionIndex]] : []}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        />
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  item: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  question: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: '95%',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 22,
  },
  feedback: {
    fontSize: 22,
    color: 'red',
    marginTop: 20,
  },
});
