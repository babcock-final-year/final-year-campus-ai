export type ServerResultResponse<TPayload> =
	| {
			success: true;
			res: TPayload;
	  }
	| {
			success: false;
			err: Error;
	  };
