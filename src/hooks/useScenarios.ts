import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Scenario } from '../types';
import { DEFAULT_SCENARIOS } from '../constants';

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'scenarios'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customScenarios = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Scenario[];
      
      setScenarios([...DEFAULT_SCENARIOS, ...customScenarios]);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching scenarios:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addScenario = async (scenario: Scenario | Omit<Scenario, 'id'>) => {
    try {
      if ('id' in scenario && scenario.id) {
        // Update existing
        const { id, ...data } = scenario;
        await setDoc(doc(db, 'scenarios', id), {
          ...data,
          isCustom: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Create new
        await addDoc(collection(db, 'scenarios'), {
          ...scenario,
          isCustom: true,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving scenario:", error);
      throw error;
    }
  };

  const deleteScenario = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scenarios', id));
    } catch (error) {
      console.error("Error deleting scenario:", error);
      throw error;
    }
  };

  return { scenarios, addScenario, deleteScenario, loading };
};
