describe('Basic user flow for Note-taking App', () => {
    // First, visit the note-taking app
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:5500/index.html', {waitUntil: 'networkidle0'}); // Replace with your local or deployed URL
    });
  
    // Check to make sure that the initial page is loaded and no notes are present
    it('Initial Home Page - No notes should be present', async () => {
      let notesCount = await page.$$eval('.note', notes => notes.length);
      expect(notesCount).toBe(0);
    });
  
    // Test adding a new note
    it('Add a new note', async () => {
      await page.click('.add-note'); // Click the add note button
      await page.type('.note', 'Test Note'); // Type into the new note
      await page.click('#notes-app'); // Click outside the note to trigger save
      let noteContent = await page.$eval('.note', el => el.value);
      expect(noteContent).toBe('Test Note');
    });
  
    // Test editing an existing note
    it('Edit an existing note', async () => {
      await page.click('.note'); // Click the note to edit
      await page.keyboard.press('End'); // Move cursor to end of text
      await page.keyboard.type(' - Edited'); // Type additional text
      await page.click('#notes-app'); // Click outside the note to trigger save
      let editedNoteContent = await page.$eval('.note', el => el.value);
      expect(editedNoteContent).toBe('Test Note - Edited');
    });
  
    // Test persistence of notes (they should still be there after a refresh)
    it('Persistence of notes after page refresh', async () => {
      await page.reload({waitUntil: 'networkidle0'});
      let persistedNoteContent = await page.$eval('.note', el => el.value);
      expect(persistedNoteContent).toBe('Test Note - Edited');
    });
  
    // Test deleting a note by double clicking
    it('Delete a note by double clicking', async () => {
        await page.click('.note', { clickCount: 2 });
        let notesCountAfterDeletion = await page.$$eval('.note', notes => notes.length);
        expect(notesCountAfterDeletion).toBe(0);
    });
  
    // Testing the deletion of all notes using keyboard shortcut (Ctrl+Shift+D)
    it('Delete all notes using keyboard shortcut', async () => {
      // First add two notes for deletion
      await page.click('.add-note');
      await page.type('.note:last-child', 'Note 1');
      await page.click('.add-note');
      await page.type('.note:last-child', 'Note 2');

      let dialogPromise = new Promise(resolve => page.once('dialog', async dialog => {
        await dialog.accept();
        resolve();
      }));

      await page.keyboard.down('Control');
      await page.keyboard.down('Shift');
      await page.keyboard.press('KeyD');
      await page.keyboard.up('Shift');
      await page.keyboard.up('Control');
      
      // Confirm deletion if prompted
      await dialogPromise;
  
      let notesCountAfterDeletion = await page.$$eval('.note', notes => notes.length);
      expect(notesCountAfterDeletion).toBe(0);
    }, 20000);
  });