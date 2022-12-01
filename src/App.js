import React, { useState, useRef } from 'react';
import {
  Flex,
  Center,
  Button,
  Text,
  Input,
  InputRightElement,
  InputGroup,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react'
import { FcGoogle } from "react-icons/fc";
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <Flex width={'100%'} h={'100vh'} maxWidth={'750px'} bgGradient='linear(to-r, purple.100, purple.200)' justifyContent={'center'} alignItems={'center'}>
      <Button onClick={signInWithGoogle} colorScheme={'purple'} paddingLeft={9}>
        <FcGoogle size={24} />
        <Text ml={-2} alignSelf={'center'}>Sign in with Google</Text>
      </Button>
    </Flex>
  )
}

function ChatRoom({ onOpen }) {
  const dummy = useRef()
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('')

  const sendMessage = async () => {
    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Flex flexDirection={'column'} bg={'#F0EEF6'} justifyContent={'space-between'}>
      <Flex padding={'12px 24px 12px 24px'} bgGradient='linear(to-r, purple.200, purple.400)' justifyContent={'space-between'}>
        <Flex>
          <Avatar name='avatar' src='https://bit.ly/dan-abramov' />
          <Flex flexDirection={'column'} mt={1} alignItems={'start'}>
            <Text lineHeight={0} mb={0} fontWeight={'extrabold'} fontSize={'lg'}>Nur Muhamad Rum</Text>
            <Text lineHeight={0} mb={0} fontSize={'sm'}>Online</Text>
          </Flex>
        </Flex>
        <Button onClick={onOpen} colorScheme={'red'}>Logout</Button>
      </Flex>
      <Flex flexDirection={'column'} h={'80vh'} overflow={'scroll'}>
        <Flex flexDirection={'column'} minW={'50vw'} mt={6}>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </Flex>
      </Flex>
      <Flex padding={'12px 24px 12px 24px'}>
        <InputGroup onSubmit={sendMessage}>
          <Input placeholder='Message' value={formValue} onChange={(e) => setFormValue(e.target.value)} h={'50px'} type='text' bg={'#FAFAFA'} color={'#000'} />
          <InputRightElement width='7.5rem' h={'50px'} >
            <Button w={100} h={'35px'} size='sm' colorScheme={'purple'} onClick={sendMessage}>
              Send
            </Button>
          </InputRightElement>
        </InputGroup>
      </Flex>
    </Flex>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';
  return (
    <Flex pl={6} pr={6} mb={5} alignSelf={messageClass === 'sent' && 'flex-end'} flexDirection={messageClass === 'sent' && 'row-reverse'}>
      <Avatar name='avatar' src={photoURL ? photoURL : 'https://bit.ly/dan-abramov'} />
      <Flex ml={2} mr={2} rounded={'2xl'} bgGradient={messageClass === 'sent' ? 'linear(to-r, purple.400, purple.300)' : 'linear(to-r, teal.300, teal.400)'}>
        <Text textAlign={'justify'}>{text}</Text>
      </Flex>
    </Flex>
  )
}


function App() {
  const [user] = useAuthState(auth);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  return (
    <Center bg={'#B1AFCB'} minH={'100vh'} width={'100%'}>
      {user ? <ChatRoom onOpen={onOpen} /> : <SignIn />}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Logout
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You want logout from Superchat app.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => {
                onClose()
                auth.signOut()
              }} ml={3}>
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Center>
  );
}

export default App;
