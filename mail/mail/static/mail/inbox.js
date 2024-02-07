document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox')
    emailInbox();
  })
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    emailSent();
  })
  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archive');
    archivedEmail();
  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  emailInbox();
});

function testo() {
  console.log("testo")
}

function compose_email() {

  // Okay, so this is just to show the COMPOSE VIEW. and block any other (well, cuz we're not switching "pages" here. just "reloading" the page with different view)
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#wholeMail-view').style.display = 'none';

  // And to follow that up, we need to zero out the compose thingy, so that it is literally empty (later will be filled by user)
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// okay, so, when the user reply, automatically the field also need to be a COMPOSE view. (cuz, technically they're also composing a new email. its just so happen that, they're replying to an alreay sended email. ANyway)
function replying(zeSender, oriSubject, oriBody) {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#wholeMail-view').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = zeSender;
    document.querySelector('#compose-subject').value = oriSubject;
    // OKAY, this might seems a lil waytoodank, but hang in there my future self who will read this spagetti code and not understand what the heck is happeeninggg aaaaaaa.
    // basically new Date().toLocaleString() returns the current date and time as a string. and then we wrap them in curly braces so that it is NOT LITERALLY "new Date().toLocaleString()" | and then, /n just means new line. much like in C
    document.querySelector('#compose-body').value = `On ${new Date().toLocaleString()}, ${zeSender} wrote:\n\n${oriBody}`;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views (same like before)
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#wholeMail-view').style.display = 'none';

  // OKAAYY, hang on there for a moment again my future self :')
  // it is ackhtually simpple. the mailbox.charAt(0) = TAKE THE FIRST LETTER of the mailbox and then change it to uppercase. after taking THE FIRST LETTER, append the rest of the letter EXCEPT the first letter with mailbox.slice(1).
  document.querySelector('#emails-view').innerHTML = 
  `<h3>
      ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}
  </h3>`;

}

// here's a function to send an email. Be it if the user wanna send a fresh mail, or replying an  email. it is still "SENDING and email"
function sendEmail(event) {
  //
  const recipient = document.querySelector('#compose-recipients');
  const recipientValue = recipient.value;

  const subject = document.querySelector('#compose-subject');
  const subjectValue = subject.value;

  const body = document.querySelector('#compose-body');
  const bodyValue = body.value;

  // console.log(recipientValue);
  // console.log(subjectValue);
  // console.log(bodyValue);

  fetch('/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipients: recipientValue,
      subject: subjectValue,
      body: bodyValue
    })
  })
  .then(response => response.json())
  .then(result => {
      // cuz this is not a production code, imma just leave the console.log here. cuz why not?
    console.log('email sent: ', result)
    load_mailbox('sent')
    emailSent();
  })
  .catch(error => {
    console.error('email cant be send but whyyyyyyyy:', error)
  })
}

// the name might be confusing for a little bittt, buuutt it is basically the email that we HAS SENT to anyone
function emailSent() {

  const emailsView = document.querySelector('#emails-view');
  // create an UL, and then create an LI
  const ulElement = document.createElement('ul');
    
  fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {

      emails.forEach(email => {
          // here we create that LI part after the UL
        const garis = document.createElement('li');
        // im pretty frikkin suree that there are better ways to implement this other than using 'data-email-id' and then setting it to be an attribute to a const called 'garis' (im really sorry to the CS50 staff that will be reading this code of abomination). 
        garis.setAttribute('data-email-id', email.id);
        garis.innerHTML = 
        // i know... this look gibberish
        `<span class="email-box">

          <span class="email-details">

            <span class="email-sender">${email.sender}</span>
            <span class="email-sender">${email.subject}</span>
            <span class="email-sender">${email.timestamp}</span>

          </span>

        </span>`
      // and then append that LI to the UL
        ulElement.appendChild(garis);
      });
  // AND THEENNN append that UL that HAVE the LI, TO the emailsView.
      emailsView.appendChild(ulElement);
      // get all the LI tag inside the emails-view. and then for Each of those LI tag give them an event listener that listens to a click sound. if clicked then do the "handleEmailCLick" function.
      const emailElements = document.querySelectorAll('#emails-view li')
      emailElements.forEach(emailElement => {
        emailElement.addEventListener('click', handleEmailClick);
      })
    })
    .catch(error => {
      console.error('Error fetching emails hmmge:', error)
    })
}
// Well, this one is a function that handle the view when an email is clicked. Lets say someone is at inbox. and want to view an email inside that inbox. This is the function for that.
function handleEmailClick(event) {
  // remember the 'data-email-id' that we make before? we take that data-email-id OF THE EMAIL THAT just had an event (and that event is a click) and then attach it to const emailId.
  const emailId = event.currentTarget.getAttribute('data-email-id');
// do the fetching process just like how the cs50w site told us to
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
      // and then create the actual view for THAT email. we take the wholeMail-view (this is a view that i created so that the user can see the content of the email) adn go inside the innerHTMl.

    const wholeMailView = document.querySelector('#wholeMail-view');
    wholeMailView.innerHTML = 
    // inside it, we basically create and prefilled some fields. such as the Sender, To who, the subject of the email, the timestamp, and so on and so forth.
    // The part that was tricky to do for me is the button part. i gave up and just go with spagetti at the end. Sorryyy for the mess :')
    // when the reply button is clicked, do the "replying" function and give it the email sender, the email subject and the email body (replying needs those 3 parameters)
    // and then there is an archive button that either will be archive or unarchive depend on the arhive state of that particular email
    `
      <strong>From: </strong> ${email.sender} <br>
      <strong>To: </strong> ${email.recipients} <br>
      <strong>Subject: </strong> ${email.subject} <br>
      <strong>Timestamp: </strong> ${email.timestamp}
      <br> <br>

      <button id="reply-button" class="button-rounder" 
          onClick="replying('${email.sender}', 'Re: ${email.subject}', '${email.body}');"> Reply 
      </button>

      <button id="archive-button" class="button-rounder">
          ${email.archived ? 'Unarchive' : 'Archive'}
      </button>

      <hr>
      ${email.body}
    `

    // after assigning those HTML into the innerHTML of wholeMailView, now we actually display the wholeMailView and attach the archive (or unarchive) button to it.
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    wholeMailView.style.display = 'block';

    const archiveButton = document.querySelector('#archive-button');
    
    // if there is an archive button (which there is btw)
    if (archiveButton) {
      // add an click eventListener to the button and see, if an email is archived, call the markEmailAsArchived function and pass in the email.id and 'false' as a parameter. and vice versa
      // why pass in "false" aswell? because markEmailAsArchived will do the archiving and unarchiving activity for us. not here. here we just "prepping" the markEmailAsArchived function so to say.
      archiveButton.addEventListener('click', async function() {
        if (email.archived) {
          // If the email is archived, unarchive it
          await markEmailAsArchived(email.id, false);
        } else {
          // If the email is not archived, archive it
          await markEmailAsArchived(email.id, true);
        }
        // Reload the mailbox after the action
        await load_mailbox('inbox');
        emailInbox();
        // here i just check if the email has been successfully archived or not. it is not really needed, but i do it anyway
        fetch(`/emails/${emailId}`)
          .then(response => response.json())
          .then(updatedEmail => {
            console.log('Email archive status after unarchiving:', updatedEmail.archived);
          })
          .catch(error => {
            console.error("Error fetching updated email:", error);
          });
      });
    }
  })
  .catch(error => {
    console.error("Error fetching ze email hmmge: ", error);
  });
}
// this is the function related to the emailInbox
function emailInbox() {

  const emailsView = document.querySelector('#emails-view');
  const ulElement = document.createElement('ul');
  // we do the fetching as usual
  fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      // filter out archived emails. need to do this cuz the archived email isnt being removed right after i click archive
      emails = emails.filter(email => !email.archived)

      // clear existing email list. need to do this for the same reason as above
      emailsView.innerHTML = ''
      // for each of the email create an li tag and attach it to const garis. garis will have a classname based if the email has been read or not
      emails.forEach(email => {
        const garis = document.createElement('li');
      // now give 'garis' a className baed on if the email has been read or not
        garis.className = email.read ? 'email-read' : 'email-unread';

        // testing true false in email-read (dont need to include this on the finish product, but anywayyy)
        console.log('Email ID:', email.id, 'Read:', email.read);

        garis.addEventListener('click', function() {
          markEmailAsRead(email.id)
        })
        // here we set the data-email-id to garis as an attribute just like we did before.
        garis.setAttribute('data-email-id', email.id);
        // and then we create a span so that the suer can view the email.sender, subject and timestamp when the view the inbox. (so that they dont have to check the email one by one in order to know who send it)
        garis.innerHTML = 
        `<span class="email-box">

          <span class="email-details">

            <span class="email-sender">${email.sender}</span>
            <span class="email-sender">${email.subject}</span>
            <span class="email-sender">${email.timestamp}</span>

          </span>

        </span>`
  
        ulElement.appendChild(garis);
      });
  
      emailsView.appendChild(ulElement);

      // process the email that we got
      const emailElements = document.querySelectorAll('#emails-view li')
      emailElements.forEach(emailElement => {
        emailElement.addEventListener('click', handleEmailClick);
      })
    })
    .catch(error => {
      console.error('Error fetching emails hmmge:', error)
    })
}

// here's a function to mark the email as Read
function markEmailAsRead(emailId) {
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

// and here's one to mark the email as archived
function markEmailAsArchived(emailId, archived) {
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: archived
    })
  })
  .then(response => response.json())
  // i don't necessarily need to do this, but anyway.
  .then(data => {
    console.log(`Email ${archived ? 'archived' : 'unarchived'} successfully:`, data);
  })
  .catch(error => {
    console.error(`Error ${archived ? 'archiving' : 'unarchiving'} email:`, error);
  });
}
// here is the function to ACTUALLY ACTUALLY do the archiving process
function archivedEmail() {
  const emailsView = document.querySelector('#emails-view');
  const ulElement = document.createElement('ul');
  // do the fetching as we usually do
  fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
      // and then for each email we do a similar thing to before. create an li and later put that li inside an ul and then put that ul inside the emailsView. 
      // for each of those email give them a class name based on if they're readed or not, and then we add a click eventListener to them. If it is clicked, call the markEmailAsRead function with the email.id as a parameter
      emails.forEach(email => {
        const garis = document.createElement('li');

        garis.className = email.read ? 'email-read' : 'email-unread';
        console.log('Email ID:', email.id, 'Read:', email.archived);

        garis.addEventListener('click', function() {
          markEmailAsRead(email.id)
        })
        // similar to email inbox, here we create some span and put the necessary field on them (i know its very very not pretty. but it works for now)
        garis.setAttribute('data-email-id', email.id);
        garis.innerHTML = 
        `<span class="email-box">

          <span class="email-details">

            <span class="email-sender">${email.sender}</span>
            <span class="email-sender">${email.subject}</span>
            <span class="email-sender">${email.timestamp}</span>

          </span>

        </span>`
  
        ulElement.appendChild(garis);
      });
  
      emailsView.appendChild(ulElement);

      // and then we loop through every single li (garis) and we listen to click on them. if clicked, we do the handleEmailClick function which will enable the viewer to see the content of the email
      const emailElements = document.querySelectorAll('#emails-view li')
      emailElements.forEach(emailElement => {
        emailElement.addEventListener('click', handleEmailClick);
      })
    })
    .catch(error => {
      console.error('Error fetching emails hmmge:', error)
    })
}