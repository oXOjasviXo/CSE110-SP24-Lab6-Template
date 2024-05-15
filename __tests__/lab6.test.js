describe('Basic user flow for Website', () => {
  // First, visit the lab 8 website
  beforeAll(async () => {
    await page.goto('https://elaine-ch.github.io/Lab6_Part1_Starter/', {waitUntil: 'networkidle0'});
  });

  // Next, check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');
    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });
    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');
    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;
    // Query select all of the <product-item> elements
    const prodItemsData = await page.$$eval('product-item', prodItems => {
      return prodItems.map(item => {
        // Grab all of the json data stored inside
        return data = item.data;
      });
    });
    
    // Make sure the title, price, and image are populated in the JSON
    for (let i = 0; i < prodItemsData.length; i++) {
      console.log(`Checking product item ${i + 1}/${prodItemsData.length}`);
      if (prodItemsData[i].title.length == 0 || 
        prodItemsData[i].price.length == 0 || 
        prodItemsData[i].image.length == 0) {
        allArePopulated = false;
        console.log(`Failed at product item ${i}`);
        break; // Exit the loop as soon as an unpopulated item is found
      }
    }
    // Expect allArePopulated to still be true
    expect(allArePopulated).toBe(true);

    // TODO - Step 1 DONE modified above
    // Right now this function is only checking the first <product-item> it found, make it so that
    // it checks every <product-item> it found

  }, 10000);

  it('Make sure <product-item> elements are populated', async () => {
    const allArePopulated = await page.$$eval('product-item', prodItems => {
      return prodItems.every(item => {
        const data = item.data;
        return data && data.title && data.title.length > 0 && 
               data.price && data.price > 0 && 
               data.image && data.image.length > 0;
      });
    });
    expect(allArePopulated).toBe(true);
  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');
    // TODO - Step 2 DONE below
    // Query a <product-item> element using puppeteer ( checkout page.$() and page.$$() in the docs )
    let productItemHandle = await page.$('product-item');
    // Grab the shadowRoot of that element (it's a property), then query a button from that shadowRoot.
    let shadowRoot = await productItemHandle.getProperty('shadowRoot');
    // Once you have the button, you can click it and check the innerText property of the button.
    await shadowRoot.$eval('button', button => button.click());
    let button = await shadowRoot.$('button');
    let innerTxtHndl = await button.getProperty('innerText');
    // Once you have the innerText property, use innerText.jsonValue() to get the text value of it
    let buttonTxt = await innerTxtHndl.jsonValue();
    //await my brain delivery
    expect(buttonTxt).toBe('Remove from Cart');
  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');
    // TODO - Step 3
    // Query select all of the <product-item> elements, then for every single product element
    let prodItems = await page.$$('product-item');
    if (prodItems.length !== 20) {
      console.log('Error: Expected 20 product items found', prodItems.length);
    }
    // get the shadowRoot and query select the button inside, and click on it.
    // Check to see if the innerText of #cart-count is 20
    await page.waitForSelector('product-item');
    let cnt = 0;
    let cartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));
    console.log('Count rn ', cartCnt);
    for(let item of prodItems) {
      cnt++;
      console.log('On item ', cnt);
      let shadowRoot = await item.getProperty('shadowRoot');
      let button = await shadowRoot.$('button');
      
      let buttonText = await (await button.getProperty('innerText')).jsonValue();
      // why is the 1st one already in cart so annoying
      if (buttonText == 'Add to Cart') {
        await button.asElement().hover(); 
        await button.click();
      }
      
      let cartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));
      console.log('Count rn ', cartCnt);
    }
    console.log('All add to cart buttons clicked.');
    
    let finCartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));

    expect(finCartCnt).toBe(prodItems.length);
  }, 60000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    // TODO - Step 4
    // Reload the page, then select all of the <product-item> elements, and check every
    // element to make sure that all of their buttons say "Remove from Cart".
    // Also check to make sure that #cart-count is still 20
    let crtBfrRld = await page.$eval('#cart-count', el => parseInt(el.textContent));
    let remember = true;
    await page.reload({waitUntil : 'networkidle0'});

    let prodItems = await page.$$('product-item');
    for(let item of prodItems) {
      let shadowRoot = await item.getProperty('shadowRoot');
      let button = await shadowRoot.$('button');
      let buttonText = await (await button.getProperty('innerText')).jsonValue();
      if(buttonText == 'Add to Cart') {
        remember = false;
      }
    }
    let crtAftrRld = await page.$eval('#cart-count', el => parseInt(el.textContent));
    if(crtAftrRld != crtBfrRld) {
      remember = false;
    }
    expect(remember).toBe(true);
  }, 30000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {
    // TODO - Step 5
    // At this point he item 'cart' in localStorage should be 
    // '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
    let expectedCart = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    let actualCart = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart'));
    });

    console.log(`Actual cart contents: ${actualCart.join(', ')}`);

    expect(actualCart).toEqual(expect.arrayContaining(expectedCart));
    expect(actualCart.length).toBe(expectedCart.length);
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');
    // TODO - Step 6
    // Go through and click "Remove from Cart" on every single <product-item>, just like above.
    // Once you have, check to make sure that #cart-count is now 0
    let prodItems = await page.$$('product-item');

    let cnt = 0;
    let cartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));
    console.log('Count rn ', cartCnt);
    for(let item of prodItems) {
      cnt++;
      console.log('On item ', cnt);
      let shadowRoot = await item.getProperty('shadowRoot');
      let button = await shadowRoot.$('button');
      
      let buttonText = await (await button.getProperty('innerText')).jsonValue();
      
      if (buttonText == 'Remove from Cart') {
        await button.asElement().hover(); 
        await button.click();
      }
      
      let cartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));
      console.log('Count rn ', cartCnt);
    }
    console.log('All remove from cart buttons clicked.');
    
    let finCartCnt = await page.$eval('#cart-count', el => parseInt(el.textContent));

    expect(finCartCnt).toBe(0);

  }, 30000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    // TODO - Step 7
    // Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
    // is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
    // Also check to make sure that #cart-count is still 0
    let crtBfrRld = await page.$eval('#cart-count', el => parseInt(el.textContent));
    let remember = true;
    await page.reload({waitUntil : 'networkidle0'});

    let prodItems = await page.$$('product-item');
    for(let item of prodItems) {
      let shadowRoot = await item.getProperty('shadowRoot');
      let button = await shadowRoot.$('button');
      let buttonText = await (await button.getProperty('innerText')).jsonValue();
      if(buttonText == 'Remove from Cart') {
        remember = false;
      }
    }
    let crtAftrRld = await page.$eval('#cart-count', el => parseInt(el.textContent));
    if(crtAftrRld != crtBfrRld) {
      remember = false;
    }
    expect(remember).toBe(true);
  }, 30000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    // TODO - Step 8
    // At this point he item 'cart' in localStorage should be '[]', check to make sure it is
    let expectedCart = [];
    let actualCart = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart'));
    });

    console.log(`Actual cart contents: ${actualCart.join(', ')}`);

    expect(actualCart).toEqual(expect.arrayContaining(expectedCart));
    expect(actualCart.length).toBe(expectedCart.length);
  });
});
