package main

import (
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"testing"
)

func TestWechatPaySignature(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	message := "POST\n/v3/pay/transactions/jsapi\n1\nnonce\n{}\n"
	signature, err := signWechatPayMessage(key, message)
	if err != nil {
		t.Fatal(err)
	}
	raw, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		t.Fatal(err)
	}
	digest := sha256.Sum256([]byte(message))
	if err = rsa.VerifyPKCS1v15(&key.PublicKey, crypto.SHA256, digest[:], raw); err != nil {
		t.Fatal(err)
	}
}

func TestDecryptWechatPayNotification(t *testing.T) {
	const apiV3Key = "0123456789abcdef0123456789abcdef"
	plaintext, err := json.Marshal(wechatPayTransaction{OutTradeNo: "LBB1", TransactionID: "4200", TradeState: "SUCCESS"})
	if err != nil {
		t.Fatal(err)
	}
	block, err := aes.NewCipher([]byte(apiV3Key))
	if err != nil {
		t.Fatal(err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		t.Fatal(err)
	}
	nonce := []byte("123456789012")
	associatedData := "transaction"
	ciphertext := gcm.Seal(nil, nonce, plaintext, []byte(associatedData))
	client := &wechatPayClient{apiV3Key: apiV3Key}
	transaction, err := client.decryptNotification(wechatPayEncryptedResource{
		Algorithm: "AEAD_AES_256_GCM", Ciphertext: base64.StdEncoding.EncodeToString(ciphertext), Nonce: string(nonce), AssociatedData: associatedData,
	})
	if err != nil {
		t.Fatal(err)
	}
	if transaction.OutTradeNo != "LBB1" || transaction.TransactionID != "4200" || transaction.TradeState != "SUCCESS" {
		t.Fatalf("unexpected transaction: %#v", transaction)
	}
}
